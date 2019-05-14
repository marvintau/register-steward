let prom = (api) => {
  // console.log("prom", api);
  return (options, ...params) => {
    return new Promise((resolve, reject) => {
      api(Object.assign({}, options, { success: resolve, fail: reject }), ...params);
    });
  }
}

module.exports = prom;