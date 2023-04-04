const logger = (req, res, next) => {
    console.log(`Petición get desde ${req.method} - ${req.url} con código de status: ${res.statusCode}`);
    next();
}
  
module.exports = logger;