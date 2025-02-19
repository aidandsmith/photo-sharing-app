# photo-sharing-app

-Setup Instructions-

1. Generate SSL Certificate: Used OpenSSL to generate self-signed certificates (private-key.pem and certificate.pem) for local development.
    - Create certificates directory.
    - Generate private key and certificate using OpenSSL.
    - Set proper file permissions.

2. Install Dependencies: Installed required modules including express, https, helmet, and hsts using npm.

3. Add HTTPS Configuration: Imported necessary modules (https, fs, express, helmet, hsts).

4. Configure SSL in the Server: Loaded SSL files using fs.readFileSync for both private key and certificate.

5. Run the HTTPS Server: Implemented dual server setup - HTTP on port 3000 and HTTPS on port 3443

-SSL Configuration-

For this project, we implemented a dual-server approach with both HTTP (port 3000) and HTTPS (port 3443) servers. The SSL configuration uses local certificate files (private-key.pem and certificate.pem), which are appropriate for development purposes. 

While production environments should use trusted certificates from authorities like Let's Encrypt, self-signed certificates are sufficient for local development and testing.


The security implementation includes several key components:

1. Helmet Integration: The application uses the Helmet middleware for setting security headers. This provides essential protection against common web vulnerabilities by default.

2. HSTS Implementation: The code includes a robust HSTS (HTTP Strict Transport Security) configuration with:

   - Maximum age of 31536000 seconds (1 year)

   - Inclusion of subdomains

   - Preload flag enabled

3. User Validation: Implemented a basic security layer with user validation middleware that checks against a predefined list of valid user IDs (asmith, kfernandez, brichards, alin).

4. Static File Security: All static files are served from the /src directory using proper file path handling with path.join()


-Caching Strategies-

1. Routes with Caching:

   - / (Home page)
Purpose: Main landing page
Cache Duration: 24 hours (86400 seconds)
Benefit: Improved performance for static landing page

   - /feed (Photo feed)
Purpose: Display photo stream
Cache Duration: 5 minutes (300 seconds)
Benefit: Balance between fresh content and performance

   - /post/:id
Purpose: Individual post display
Cache Duration: 1 hour (3600 seconds)
Benefit: Improved performance for static post content


2. Routes without Caching (No-Store):

   - /profile/:userId
Purpose: User profile pages
Strategy: No-store header
Reason: Ensures fresh user data

   - /upload
Purpose: Photo upload interface
Strategy: No-store header
Reason: Form submission security

   - /api/users
Purpose: User validation endpoint
Strategy: No-store header
Reason: Real-time user verification required

3. Implementation Details:
- Using staticCache middleware for cached routes
- Explicit no-store headers for sensitive routes
- Cache durations optimized for content type
- Security-conscious caching decisions


-Lessons Learned-

1. Security Implementation:
- Challenge: Setting up comprehensive security headers
- Solution: Implemented Helmet middleware
- Learning: Security layers need careful configuration

2. User Authentication:
- Challenge: Implementing secure user validation
- Solution: Created middleware-based validation
- Learning: Importance of proper user verification

4. SSL Configuration:
- Challenge: Setting up dual HTTP/HTTPS servers
- Solution: Proper certificate management
- Learning: Development vs production certificate handling

5. Performance vs Security:
- Challenge: Balancing speed with security
- Solution: Prioritized security for user data
- Learning: Security-first approach for sensitive routes