const cookieOptions = {
  httOnly: true,
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
};

module.exports = cookieOptions;