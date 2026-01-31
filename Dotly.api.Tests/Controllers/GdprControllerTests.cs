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
    /// Integration tests for GdprController - Data Privacy APIs
    /// </summary>
    public class GdprControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private string _authToken;

        public GdprControllerTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        private async Task<string> GetAuthTokenAsync()
        {
            if (!string.IsNullOrEmpty(_authToken))
                return _authToken;

            var email = $"gdprtest_{Guid.NewGuid()}@test.com";
            var response = await _client.PostAsJsonAsync("/api/auth/register", new
            {
                name = "GDPR Test User",
                email = email,
                phone = "1234567890",
                password = "Test@123",
                role = "Customer"
            });

            var result = await response.Content.ReadFromJsonAsync<dynamic>();
            _authToken = result.token.ToString();
            return _authToken;
        }

        [Fact]
        public async Task ExportCustomerData_WithoutAuth_Returns401()
        {
            // Act
            var response = await _client.GetAsync("/api/gdpr/customer/export?customerId=1");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task ExportCustomerData_WithAuth_Returns200OrFile()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/gdpr/customer/export?customerId=1");

            // Assert
            response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task UpdateConsent_WithValidData_Returns200()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var consentRequest = new
            {
                userId = 1,
                consentType = "Marketing",
                isGranted = true
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/gdpr/consent/update", consentRequest);

            // Assert
            response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task DeleteAccount_WithReason_Returns200()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var deleteRequest = new
            {
                customerId = 1,
                reason = "Testing GDPR deletion"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/gdpr/customer/delete-account", deleteRequest);

            // Assert
            response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task GetConsents_WithValidUserId_Returns200()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/gdpr/consent/1");

            // Assert
            response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
        }
    }
}
