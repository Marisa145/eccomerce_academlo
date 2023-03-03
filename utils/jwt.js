const jwt = require('jsonwebtoken');

const generateJWT = id => {
  //creamos una promesa
  return new Promise((resolve, reject) => {
    const payload = { id };
  //para frimar un token necesitamos tener el payload y nos creamos una segura con smalldevtools(no tiene q terminar en igual)
    jwt.sign(
      payload,
      process.env.SECRET_JWT_SEED,
      {
        //el tiempo de expiracion del token (2h)
        expiresIn: process.env.JWT_EXPIRE_IN,
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        resolve(token);
      }
    );
  });
};

module.exports = generateJWT;
