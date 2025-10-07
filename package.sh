#!/bin/bash
# Package extension for Mozilla submission

VERSION="0.1.3"
NAME="johns-fb-marketplace-saver"

echo "Packaging ${NAME}-${VERSION}..."

# Remove old package if exists
rm -f "${NAME}-${VERSION}.zip"

# Create package with only necessary files
zip -r "${NAME}-${VERSION}.zip" \
  manifest.json \
  content.js \
  popup.html \
  popup.js \
  styles.css \
  icons/

echo ""
echo "✅ Package created: ${NAME}-${VERSION}.zip"
echo ""
echo "Next steps:"
echo "1. Go to https://addons.mozilla.org/developers/"
echo "2. Submit for signing (choose 'On your own' for self-distribution)"
echo "3. Download the signed .xpi file"
echo "4. Upload signed .xpi and updates.json to your website"
echo ""
echo "See DEPLOYMENT.md for full instructions"
