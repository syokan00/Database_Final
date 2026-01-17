# Changelog

## [Unreleased]

### Fixed
- Fixed upload functionality by refactoring storage abstraction layer to support multiple backends (Supabase Storage, Cloudinary, MinIO)
- Fixed item category filter issue in ItemsPage (textbook category now correctly filters items)
- Resolved Supabase Storage RLS policy errors with proper policy configuration
- Fixed Redis connection errors by making Redis optional via `REDIS_ENABLED` environment variable
- Fixed Python version compatibility issues on Render deployment (using Python 3.11)
- Fixed GitHub Pages routing issues with HashRouter and URL redirects

### Changed
- Refactored upload functionality to use storage abstraction layer instead of direct MinIO dependency
- Migrated Supabase Storage implementation to use HTTP API directly instead of Python client library (avoids proxy parameter compatibility issues)
- Made Redis optional - application works without Redis connection
- Improved error handling and logging for storage operations

### Added
- Support for multiple storage backends: Supabase Storage, Cloudinary, MinIO
- Comprehensive storage configuration guides
- Detailed troubleshooting documentation
- Enhanced logging for debugging deployment issues

---

## Commit History

### Commit 54a55e4 (Jan 16, 2026)
**Fix: Refactor upload functionality with storage abstraction layer and fix item category filter**

- Modified `backend/app/uploads.py` to use storage abstraction layer
- Fixed item category filter in `frontend/src/pages/ItemsPage.jsx` (textbook category)
- This commit enabled support for multiple storage backends and fixed filtering issues

