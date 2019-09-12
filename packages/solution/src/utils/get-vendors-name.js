function getVendorsName(vendors) {
  if (vendors) {
    if (typeof vendors === 'string') {
      return vendors;
    }
    return 'vendors';
  }
  return false;
}

module.exports = getVendorsName;
