using System;
using System.Collections.Generic;
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
    /// Unit tests for DealService - Deal Engine Logic
    /// </summary>
    public class DealServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<DealService>> _loggerMock;
        private readonly DealService _service;
        private readonly int _testTenantId = 1;

        public DealServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _loggerMock = new Mock<ILogger<DealService>>();
            _service = new DealService(_context, _loggerMock.Object);

            SeedTestData();
        }

        private void SeedTestData()
        {
            // Seed test tenant
            _context.Tenants.Add(new Tenant
            {
                Id = _testTenantId,
                Name = "Test Shop",
                DotsPerDollar = 10,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            // Seed test customer
            _context.Customers.Add(new Customer
            {
                Id = 1,
                TenantId = _testTenantId,
                Name = "Test Customer",
                Email = "test@test.com",
                Phone = "1234567890",
                TotalDots = 100,
                TotalSpent = 500,
                TotalVisits = 10,
                IsActive = true,
                JoinedAt = DateTime.UtcNow.AddDays(-30)
            });

            // Seed test deal templates
            _context.DealTemplates.AddRange(
                // Spend threshold deal: $50 → 50 bonus dots
                new DealTemplate
                {
                    Id = 1,
                    TenantId = _testTenantId,
                    Title = "Spend $50 Bonus",
                    TriggerType = TriggerType.SpendThreshold,
                    TriggerValue = 50,
                    BenefitType = BenefitType.BonusDots,
                    BenefitValue = 50,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                // Visit milestone: 10 visits → 100 bonus dots
                new DealTemplate
                {
                    Id = 2,
                    TenantId = _testTenantId,
                    Title = "10 Visits Milestone",
                    TriggerType = TriggerType.VisitMilestone,
                    TriggerValue = 10,
                    BenefitType = BenefitType.BonusDots,
                    BenefitValue = 100,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                // Streak deal: 7 day streak → 2x multiplier
                new DealTemplate
                {
                    Id = 3,
                    TenantId = _testTenantId,
                    Title = "7 Day Streak",
                    TriggerType = TriggerType.ConsecutiveDays,
                    TriggerValue = 7,
                    BenefitType = BenefitType.Multiplier,
                    BenefitValue = 2,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            );

            _context.SaveChanges();
        }

        [Fact]
        public async Task EvaluateDeals_WithSpendThreshold_ReturnsTriggeredDeal()
        {
            // Arrange
            var customerId = 1;
            var transactionAmount = 60m; // Above $50 threshold
            var baseDotsEarned = 600; // 60 * 10 dots per dollar

            // Act
            var result = await _service.EvaluateDealsAsync(customerId, transactionAmount, baseDotsEarned);

            // Assert
            result.Should().NotBeNull();
            result.TriggeredDeals.Should().HaveCount(1);
            result.TriggeredDeals.First().DealTemplateId.Should().Be(1);
            result.TriggeredDeals.First().BonusDotsEarned.Should().Be(50);
            result.TotalBonusDots.Should().Be(50);
        }

        [Fact]
        public async Task EvaluateDeals_WithVisitMilestone_ReturnsTriggeredDeal()
        {
            // Arrange
            var customerId = 1;
            var transactionAmount = 10m;
            var baseDotsEarned = 100;

            // Customer already has 10 visits (seeded), this is 11th
            var customer = await _context.Customers.FindAsync(customerId);
            customer.TotalVisits = 10;
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.EvaluateDealsAsync(customerId, transactionAmount, baseDotsEarned);

            // Assert
            result.Should().NotBeNull();
            var milestoneDeal = result.TriggeredDeals.FirstOrDefault(d => d.DealTemplateId == 2);
            milestoneDeal.Should().NotBeNull();
            milestoneDeal.BonusDotsEarned.Should().Be(100);
        }

        [Fact]
        public async Task EvaluateDeals_WithNoMatchingDeals_ReturnsEmptyList()
        {
            // Arrange
            var customerId = 1;
            var transactionAmount = 5m; // Below all thresholds
            var baseDotsEarned = 50;

            // Act
            var result = await _service.EvaluateDealsAsync(customerId, transactionAmount, baseDotsEarned);

            // Assert
            result.Should().NotBeNull();
            result.TriggeredDeals.Should().BeEmpty();
            result.TotalBonusDots.Should().Be(0);
        }

        [Fact]
        public async Task EvaluateDeals_WithMultipleDeals_ReturnsBothDeals()
        {
            // Arrange
            var customerId = 1;
            var transactionAmount = 100m; // Triggers spend threshold
            var baseDotsEarned = 1000;

            var customer = await _context.Customers.FindAsync(customerId);
            customer.TotalVisits = 10; // Triggers visit milestone
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.EvaluateDealsAsync(customerId, transactionAmount, baseDotsEarned);

            // Assert
            result.Should().NotBeNull();
            result.TriggeredDeals.Should().HaveCountGreaterThanOrEqualTo(2);
            result.TotalBonusDots.Should().BeGreaterThan(100);
        }

        [Fact]
        public async Task EvaluateDeals_WithInactiveDeals_DoesNotReturnInactiveDeals()
        {
            // Arrange
            var deal = await _context.DealTemplates.FindAsync(1);
            deal.IsActive = false;
            await _context.SaveChangesAsync();

            var customerId = 1;
            var transactionAmount = 60m;
            var baseDotsEarned = 600;

            // Act
            var result = await _service.EvaluateDealsAsync(customerId, transactionAmount, baseDotsEarned);

            // Assert
            result.TriggeredDeals.Should().NotContain(d => d.DealTemplateId == 1);
        }

        [Fact]
        public async Task CreateDealTemplate_WithValidData_CreatesSuccessfully()
        {
            // Arrange
            var newDeal = new DealTemplate
            {
                TenantId = _testTenantId,
                Title = "New Test Deal",
                TriggerType = TriggerType.SpendThreshold,
                TriggerValue = 25,
                BenefitType = BenefitType.BonusDots,
                BenefitValue = 25,
                IsActive = true
            };

            // Act
            var result = await _service.CreateDealTemplateAsync(newDeal);

            // Assert
            result.Should().BeTrue();
            var created = await _context.DealTemplates
                .FirstOrDefaultAsync(d => d.Title == "New Test Deal");
            created.Should().NotBeNull();
            created.Id.Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task UpdateDealTemplate_WithValidId_UpdatesSuccessfully()
        {
            // Arrange
            var dealId = 1;
            var updatedTitle = "Updated Spend Bonus";

            // Act
            var deal = await _context.DealTemplates.FindAsync(dealId);
            deal.Title = updatedTitle;
            var result = await _service.UpdateDealTemplateAsync(deal);

            // Assert
            result.Should().BeTrue();
            var updated = await _context.DealTemplates.FindAsync(dealId);
            updated.Title.Should().Be(updatedTitle);
        }

        [Fact]
        public async Task DeleteDealTemplate_WithValidId_SoftDeletesSuccessfully()
        {
            // Arrange
            var dealId = 1;

            // Act
            var result = await _service.DeleteDealTemplateAsync(dealId);

            // Assert
            result.Should().BeTrue();
            var deleted = await _context.DealTemplates.FindAsync(dealId);
            deleted.IsActive.Should().BeFalse();
        }

        [Fact]
        public async Task CalculateBonusDots_WithMultiplier_CalculatesCorrectly()
        {
            // Arrange
            var baseDotsEarned = 100;
            var multiplier = 2m;

            // Act
            var result = _service.CalculateBonusDots(baseDotsEarned, BenefitType.Multiplier, multiplier);

            // Assert
            result.Should().Be(200); // 100 * 2
        }

        [Fact]
        public async Task CalculateBonusDots_WithBonusDots_ReturnsFixedBonus()
        {
            // Arrange
            var baseDotsEarned = 100;
            var bonusDots = 50m;

            // Act
            var result = _service.CalculateBonusDots(baseDotsEarned, BenefitType.BonusDots, bonusDots);

            // Assert
            result.Should().Be(50); // Fixed bonus
        }

        [Fact]
        public async Task GetActiveDealsByTenant_ReturnsOnlyActiveDeals()
        {
            // Arrange
            var deal = await _context.DealTemplates.FindAsync(1);
            deal.IsActive = false;
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetActiveDealsByTenantAsync(_testTenantId);

            // Assert
            result.Should().NotBeNull();
            result.Should().NotContain(d => d.Id == 1);
            result.Should().OnlyContain(d => d.IsActive);
        }

        [Fact]
        public async Task EvaluateDeals_WithNullCustomer_ThrowsException()
        {
            // Arrange
            var invalidCustomerId = 9999;

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(
                async () => await _service.EvaluateDealsAsync(invalidCustomerId, 100, 1000)
            );
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
}
