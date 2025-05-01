import { ExtractJwt } from "passport-jwt";
import passportJWT from "passport-jwt";
import dotenv from "dotenv";
import passport from "passport";

import { userModel } from "./schemas/user.schema";
const JWTStrategy = passportJWT.Strategy;
dotenv.config();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'token'
};

passport.use(
  new JWTStrategy(
    jwtOptions,
    function (jwtPayload, done) {
      return userModel
        .findOne({ _id: jwtPayload.id })
        .then((user) => {
          return done(null, user);
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);
