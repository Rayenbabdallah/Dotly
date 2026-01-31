using System;
using System.Linq;
using System.Threading.Tasks;
using Dotly.Api.Data;
using Dotly.Api.Domain.Entities;
using Dotly.Api.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Dotly.Api.Tests.Services
{
    /// <summary>
    /// Unit tests for GdprService - Data Privacy & Compliance
    /// </summary>
    public class GdprServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<GdprService>> _loggerMock;
        private readonly GdprService _service;
        private readonly int _testTenantId = 1;

        public GdprServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _loggerMock = new Mock<ILogger<GdprService>>();
            _service = new GdprService(_context, _loggerMock.Object);

            SeedTestData();
        }

        private void SeedTestData()
        {
            _context.Tenants.Add(new Tenant
            {
                Id = _testTenantId,
                Name = "Test Shop",
                DotsPerDollar = 10,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            _context.Customers.Add(new Customer
            {
                Id = 1,
                TenantId = _testTenantId,
                Name = "Test Customer",
                Email = "test@test.com",
                Phone = "1234567890",
                TotalDots = 100,
                IsActive = true,
                JoinedAt = DateTime.UtcNow
            });

            _context.Users.Add(new User
            {
                Id = 1,
                TenantId = _testTenantId,
                Name = "Test User",
                Email = "user@test.com",
                Phone = "0987654321",
                Role = UserRole.Staff,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            _context.SaveChanges();
        }

        [Fact]
        public async Task ExportCustomerData_WithValidId_ReturnsJsonData()
        {
            // Arrange
            var customerId = 1;

            // Act
            var result = await _service.ExportCustomerDataAsync(customerId);

            // Assert
            result.Should().NotBeNullOrEmpty();
            result.Should().Contain("\"id\"");
            result.Should().Contain("\"name\"");
            result.Should().Contain("Test Customer");
        }

        [Fact]
        public async Task ExportCustomerData_WithInvalidId_ThrowsException()
        {
            // Arrange
            var invalidId = 9999;

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(
                async () => await _service.ExportCustomerDataAsync(invalidId)
            );
        }

        [Fact]
        public async Task DeleteCustomerAccount_WithValidId_SoftDeletesAndAnonymizes()
        {
            // Arrange
            var customerId = 1;
            var reason = "User requested deletion";

            // Act
            var result = await _service.DeleteCustomerAccountAsync(customerId, reason);

            // Assert
            result.Should().BeTrue();

            var customer = await _context.Customers.FindAsync(customerId);
            customer.IsActive.Should().BeFalse();
            customer.DeletedAt.Should().NotBeNull();
            customer.Email.Should().Contain("deleted_");
            customer.Phone.Should().Be("DELETED");
            customer.DeletionReason.Should().Be(reason);
        }

        [Fact]
        public async Task DeleteCustomerAccount_WithInvalidId_ReturnsFalse()
        {
            // Arrange
            var invalidId = 9999;

            // Act
            var result = await _service.DeleteCustomerAccountAsync(invalidId, "Test");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task UpdateConsent_WithNewConsent_CreatesSuccessfully()
        {
            // Arrange
            var userId = 1;
            var consentType = ConsentType.Marketing;
            var granted = true;

            // Act
            var result = await _service.UpdateConsentAsync(userId, consentType, granted);

            // Assert
            result.Should().BeTrue();

            var consent = await _context.UserConsents
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ConsentType == consentType);

            consent.Should().NotBeNull();
            consent.IsGranted.Should().BeTrue();
            consent.GrantedAt.Should().NotBeNull();
        }

        [Fact]
        public async Task UpdateConsent_WithExistingConsent_UpdatesSuccessfully()
        {
            // Arrange
            var userId = 1;
            var consentType = ConsentType.Marketing;

            // Create initial consent
            _context.UserConsents.Add(new UserConsent
            {
                UserId = userId,
                ConsentType = consentType,
                IsGranted = true,
                GrantedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            // Act - Revoke consent
            var result = await _service.UpdateConsentAsync(userId, consentType, false);

            // Assert
            result.Should().BeTrue();

            var consent = await _context.UserConsents
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ConsentType == consentType);

            consent.IsGranted.Should().BeFalse();
            consent.RevokedAt.Should().NotBeNull();
        }

        [Fact]
        public async Task GetConsent_WithExistingConsent_ReturnsConsent()
        {
            // Arrange
            var userId = 1;
            var consentType = ConsentType.Cookies;

            _context.UserConsents.Add(new UserConsent
            {
                UserId = userId,
                ConsentType = consentType,
                IsGranted = true,
                GrantedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetConsentAsync(userId, consentType);

            // Assert
            result.Should().NotBeNull();
            result.UserId.Should().Be(userId);
            result.ConsentType.Should().Be(consentType);
            result.IsGranted.Should().BeTrue();
        }

        [Fact]
        public async Task GetConsent_WithNoConsent_ReturnsNull()
        {
            // Arrange
            var userId = 1;
            var consentType = ConsentType.Profiling;

            // Act
            var result = await _service.GetConsentAsync(userId, consentType);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task AnonymizeExpiredData_WithOldRedemptions_AnonymizesSuccessfully()
        {
            // Arrange
            var customerId = 1;
            var oldDate = DateTime.UtcNow.AddDays(-100); // Beyond 90-day retention

            _context.Redemptions.Add(new Redemption
            {
                CustomerId = customerId,
                RewardId = 1,
                DotsUsed = 50,
                IsAnonymized = false,
                CreatedAt = oldDate
            });
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.AnonymizeExpiredDataAsync();

            // Assert
            result.Should().BeTrue();

            var redemption = await _context.Redemptions.FirstOrDefaultAsync();
            redemption.IsAnonymized.Should().BeTrue();
        }

        [Fact]
        public async Task PurgeExpiredData_WithOldDeletedCustomers_PurgesSuccessfully()
        {
            // Arrange
            var oldDeletedCustomer = new Customer
            {
                TenantId = _testTenantId,
                Name = "Old Deleted Customer",
                Email = "deleted@test.com",
                Phone = "DELETED",
                IsActive = false,
                DeletedAt = DateTime.UtcNow.AddDays(-100), // Beyond retention
                JoinedAt = DateTime.UtcNow.AddDays(-200)
            };

            _context.Customers.Add(oldDeletedCustomer);
            await _context.SaveChangesAsync();
            var customerId = oldDeletedCustomer.Id;

            // Act
            var result = await _service.PurgeExpiredDataAsync();

            // Assert
            result.Should().BeTrue();

            var customer = await _context.Customers.FindAsync(customerId);
            customer.Should().BeNull(); // Permanently deleted
        }

        [Fact]
        public async Task DeleteUserAccount_WithValidId_SoftDeletesAndAnonymizes()
        {
            // Arrange
            var userId = 1;
            var reason = "Staff member left";

            // Act
            var result = await _service.DeleteUserAccountAsync(userId, reason);

            // Assert
            result.Should().BeTrue();

            var user = await _context.Users.FindAsync(userId);
            user.IsActive.Should().BeFalse();
            user.DeletedAt.Should().NotBeNull();
            user.Email.Should().Contain("deleted_");
            user.Phone.Should().Be("DELETED");
        }

        [Fact]
        public async Task ExportUserData_WithValidId_ReturnsJsonData()
        {
            // Arrange
            var userId = 1;

            // Act
            var result = await _service.ExportUserDataAsync(userId);

            // Assert
            result.Should().NotBeNullOrEmpty();
            result.Should().Contain("\"id\"");
            result.Should().Contain("\"name\"");
            result.Should().Contain("Test User");
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
}
