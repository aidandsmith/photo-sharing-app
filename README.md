# photo-sharing-app

-Setup Instructions-

1. Generate SSL Certificate: Used OpenSSL to generate self-signed certificates (private-key.pem and certificate.pem) for local development.

2. Install Dependencies: Installed required modules including express, https, helmet, and hsts using npm.

3. Add HTTPS Configuration: Imported necessary modules (https, fs, express, helmet, hsts).

4. Configure SSL in the Server: Loaded SSL files using fs.readFileSync for both private key and certificate.

5. Run the HTTPS Server: Implemented dual server setup - HTTP on port 3000 and HTTPS on port 3443

-SSL Configuration & Lessons Learned-

For this project, we implemented a dual-server approach with both HTTP (port 3000) and HTTPS (port 3443) servers. The SSL configuration uses local certificate files (private-key.pem and certificate.pem), which are appropriate for development purposes. While production environments should use trusted certificates from authorities like Let's Encrypt, self-signed certificates are sufficient for local development and testing.

The security implementation includes several key components:

1. Helmet Integration: The application uses the Helmet middleware for setting security headers. This provides essential protection against common web vulnerabilities by default.

2. HSTS Implementation: The code includes a robust HSTS (HTTP Strict Transport Security) configuration with:

- Maximum age of 31536000 seconds (1 year)
- Inclusion of subdomains
- Preload flag enabled

3. User Validation: Implemented a basic security layer with user validation middleware that checks against a predefined list of valid user IDs (asmith, kfernandez, brichards, alin)

4. Static File Security: All static files are served from the /src directory using proper file path handling with path.join()

-Caching Strategies-

1. Static Routes:

/ (Home page)
/feed (Photo feed)
/upload (Upload page)

These routes serve static HTML files without specific caching strategies implemented.

2. Dynamic Routes:

/profile/:userId: User profiles with validation
/post/:id: Individual post pages
/api/users: API endpoint returning valid user IDs

3. Current Limitations:
- No explicit caching headers are set
- Static file serving could benefit from caching implementation
- API responses aren't cached

4. Recommended Improvements:
- Implement cache-control headers for static assets
- Add ETags for API responses
- Consider implementing a caching layer for frequently accessed user profiles