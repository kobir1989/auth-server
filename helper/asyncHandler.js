function asyncHandler(fn) { return async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    res.status(err.status || 500)
    .json({ success: false, message: err.message });
  }
};   }

module.exports = asyncHandler;
// HOF
// function asyncHandler(fn) {
//     return async function (req, res, next) {
//       try {
//         await fn(req, res, next);
//       } catch (err) {
//         res.status(err.code || 500).json({
//           success: false,
//         });
//       }
//     };
//   }