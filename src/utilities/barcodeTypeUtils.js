
export const filterBarcodeTypes = (
  allTypes,
  barcodeTypeAllowed = []
) => {
  // If no restriction → allow all
  if (!barcodeTypeAllowed || barcodeTypeAllowed.length === 0) {
    return allTypes;
  }

  const allowedSet = new Set(
    barcodeTypeAllowed.map(String) // normalize to string
  );

  return allTypes.filter(type =>
    allowedSet.has(type.id)
  );
};
