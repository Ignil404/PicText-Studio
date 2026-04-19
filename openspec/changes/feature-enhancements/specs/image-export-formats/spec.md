## ADDED Requirements

### Requirement: User can export in WebP format
The system SHALL allow users to export their rendered images in WebP format, which provides better compression than PNG while maintaining quality.

#### Scenario: Export as WebP with default quality
- **WHEN** user selects "WebP" format and clicks download
- **THEN** the system returns a .webp file that is visually identical to the original

#### Scenario: Export as WebP with custom quality
- **WHEN** user selects "WebP" format with quality "80%" and clicks download
- **THEN** the system returns a .webp file compressed to approximately 80% quality

### Requirement: User can select export quality
The system SHALL allow users to select from quality presets (low, medium, high, lossless) that control file size and visual fidelity.

#### Scenario: Export with high quality
- **WHEN** user selects "High" quality preset
- **THEN** the downloaded image has minimal compression visible artifacts

#### Scenario: Export with low quality for small file size
- **WHEN** user selects "Low" quality preset
- **THEN** the downloaded file is significantly smaller (50-70% reduction) but may show slight compression artifacts

### Requirement: User can export in multiple formats at once
The system SHALL allow users to export their render in multiple formats simultaneously as a ZIP archive.

#### Scenario: Export as ZIP with PNG and JPEG
- **WHEN** user selects PNG and JPEG formats, chooses "Download All"
- **THEN** the system returns a .zip file containing both PNG and JPEG versions of the image

#### Scenario: Export as ZIP with all formats
- **WHEN** user selects all three formats (PNG, JPEG, WebP) for download
- **THEN** the system returns a .zip file containing three image files, one for each format

### Requirement: User can select output resolution
The system SHALL allow users to select output resolution (SD, HD, 4K) which affects the dimensions of the exported image.

#### Scenario: Export in HD resolution
- **WHEN** user selects "HD (1920x1080)" resolution
- **THEN** the exported image is exactly 1920x1080 pixels

#### Scenario: Export in 4K resolution
- **WHEN** user selects "4K (3840x2160)" resolution
- **THEN** the exported image is exactly 3840x2160 pixels