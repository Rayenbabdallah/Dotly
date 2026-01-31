using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Dotly.Api;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Dotly.Api.Tests.Controllers
{
    /// <summary>
    /// Integration tests for AuthController
    /// </summary>
    public class AuthControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public AuthControllerTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Register_WithValidData_Returns200()
        {
            // Arrange
            var registerRequest = new
            {
                name = "Test User",
                email = $"test_{Guid.NewGuid()}@test.com",
                phone = "1234567890",
                password = "Test@123",
                role = "Customer"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var content = await response.Content.ReadAsStringAsync();
            content.Should().Contain("token");
        }

        [Fact]
        public async Task Register_WithDuplicateEmail_Returns400()
        {
            // Arrange
            var email = $"duplicate_{Guid.NewGuid()}@test.com";
            var registerRequest = new
            {
                name = "Test User",
                email = email,
                phone = "1234567890",
                password = "Test@123",
                role = "Customer"
            };

            // Register first time
            await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            // Act - Try to register again with same email
            var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Login_WithValidCredentials_Returns200WithToken()
        {
            // Arrange
            var email = $"login_{Guid.NewGuid()}@test.com";
            var password = "Test@123";

            // Register user first
            await _client.PostAsJsonAsync("/api/auth/register", new
            {
                name = "Test User",
                email = email,
                phone = "1234567890",
                password = password,
                role = "Customer"
            });

            var loginRequest = new
            {
                email = email,
                password = password
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var content = await response.Content.ReadAsStringAsync();
            content.Should().Contain("token");
            content.Should().Contain(email);
        }

        [Fact]
        public async Task Login_WithInvalidPassword_Returns401()
        {
            // Arrange
            var email = $"wrongpass_{Guid.NewGuid()}@test.com";

            // Register user
            await _client.PostAsJsonAsync("/api/auth/register", new
            {
                name = "Test User",
                email = email,
                phone = "1234567890",
                password = "Test@123",
                role = "Customer"
            });

            var loginRequest = new
            {
                email = email,
                password = "WrongPassword123"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Login_WithNonExistentUser_Returns401()
        {
            // Arrange
            var loginRequest = new
            {
                email = "nonexistent@test.com",
                password = "Test@123"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Register_WithInvalidEmail_Returns400()
        {
            // Arrange
            var registerRequest = new
            {
                name = "Test User",
                email = "invalid-email",
                phone = "1234567890",
                password = "Test@123",
                role = "Customer"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Register_WithWeakPassword_Returns400()
        {
            // Arrange
            var registerRequest = new
            {
                name = "Test User",
                email = $"test_{Guid.NewGuid()}@test.com",
                phone = "1234567890",
                password = "123", // Too short
                role = "Customer"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }
    }
}
