const { User, Car, WishList, Transaction } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt_token");
const axios = require("axios");
const { Op } = require("sequelize");
const { paymentNotification } = require("../helpers/nodemailer");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

function generateExternalId() {
  const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, "");
  const randomDigits = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `Invoice-${timestamp}${randomDigits}`;
}

class Controller {
  static async getUser(req, res, next) {
    try {
      let user = await User.findOne({
        where: { id: req.user.id },
      });
      // console.log(user);
      res.status(200).json({ message: "User", user });
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      let { username, email, password } = req.body;
      if (!username) {
        res.status(400).json({ name: "UsernameRequired" });
        return;
      }
      if (!email) {
        res.status(400).json({ name: "EmailRequired" });
        return;
      }
      if (!password) {
        res.status(400).json({ name: "PasswordRequired" });
        return;
      }

      let user = await User.create({ username, email, password });
      res
        .status(201)
        .json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      let { email, password } = req.body;
      if (!email) {
        res.status(400).json({ name: "EmailRequired" });
        return;
      }
      if (!password) {
        res.status(400).json({ name: "PasswordRequired" });
        return;
      }

      let user = await User.findOne({ where: { email } });
      res;
      // console.log(user);

      if (!user || !comparePassword(password, user.password)) {
        res.status(401).json({ name: "InvalidLogin" });
      }
      res.status(200).json({ access_token: signToken({ id: user.id }) });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async loginByGoogle(req, res, next) {
    try {
      const { google_token } = req.headers;
      const ticket = await client.verifyIdToken({
        idToken: google_token,
        audience: process.env.CLIENT_ID,
      });

      const payload = ticket.getPayload();
      // console.log(payload);

      let [user, created] = await User.findOrCreate({
        where: { email: payload.email },
        defaults: {
          username: payload.given_name,
          email: payload.email,
          password: `${Math.random() * 1000}`,
        },
      });
      // console.log(user, "......", created);
      const token = signToken({
        id: user.id,
      });
      res.status(200).json({ access_token: token });
      // const userid = payload["sub"];
    } catch (error) {
      next(error);
    }
  }

  static async getCar(req, res, next) {
    try {
      let { page = 1, limit = 5, sort = "priceAsc", search = "" } = req.query;

      let offset = (page - 1) * limit;

      let order;
      if (sort === "priceAsc") {
        order = [["price", "ASC"]];
      } else if (sort === "yearDesc") {
        order = [["year", "DESC"]];
      }

      let query = {
        offset: +offset,
        limit: +limit,
        order: order,
      };

      if (search) {
        query.where = {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        };
      }

      let { rows: cars, count: totalItems } = await Car.findAndCountAll(query);

      let totalPages = Math.ceil(totalItems / limit);
      // console.log(cars);
      res.status(200).json({
        message: "List Car",
        cars,
        pagination: {
          totalItems,
          totalPages,
          currentPage: +page,
        },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async postMyCar(req, res, next) {
    try {
      let myCarId = req.params.id;
      let userId = req.user.id;

      let car = await Car.findByPk(myCarId);

      if (!car) {
        res.status(404).json({ name: "NotFound" });
      }

      let wishList = await WishList.create({
        userId: userId,
        carId: myCarId,
      });

      let result = await WishList.findOne({
        where: { id: wishList.id },
        include: {
          model: Car,
          //   attributes: [name, model, year, type],
        },
      });

      res.status(201).json({ message: "Car added to wishlist", result });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async getWishList(req, res, next) {
    try {
      const userId = req.user.id;

      const wishlistItems = await WishList.findAll({
        where: { userId },
        include: [Car],
      });

      // Map the response to include only necessary details
      const wishlist = wishlistItems.map((item) => item.Car);

      res.status(200).json({ wishlist });
    } catch (error) {
      next(error);
    }
  }

  static async putUserProfile(req, res, next) {
    try {
      let { username, email, password } = req.body;
      //   console.log(req.body);

      let user = req.user;
      let updates = {};

      if (username) updates.username = username;
      if (email) updates.email = email;
      if (password) updates.password = password;

      await User.update(updates, {
        where: { id: user.id },
      });

      //   console.log(updates, "iniii");
      const updatedUser = await User.findByPk(user.id);

      res.status(200).json({ message: "User updated", updatedUser });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async deleteAccount(req, res, next) {
    try {
      let userId = req.user.id;

      let user = await User.findByPk(userId);

      if (!user) {
        res.status(404).json({ name: "NotFound" });
      }

      await Transaction.destroy({ where: { userId } });
      await WishList.destroy({ where: { userId } });
      await user.destroy();

      res.status(200).json({ message: "youre gone" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async deleteWishList(req, res, next) {
    try {
      let wishListId = +req.params.id;
      let userId = req.user.id;

      let wishListItem = await WishList.findOne({
        where: {
          carId: wishListId,
          userId: userId,
        },
      });

      if (!wishListItem) {
        return res.status(404).json({ name: "NotFound" });
      }

      await wishListItem.destroy();

      return res
        .status(200)
        .json({ message: "Wishlist item deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async transaction(req, res, next) {
    try {
      let userId = req.user.id;
      let email = req.user.email;

      let { carId, total, status } = req.body;

      let transaction = await Transaction.create({
        userId,
        carId,
        total,
        status,
      });

      const external_id = generateExternalId();
      const base64Cred = btoa(
        `xnd_development_yw06H7bmg1TjN3aFh4sYkUTTboKMS310nCyS2XBhisSve522hS8vdyU4m2MJZg:`
      );

      const response = await axios.post(
        "https://api.xendit.co/v2/invoices",
        {
          external_id: external_id,
          amount: total,
          payer_email: email,
          description: `Pembelian Mobil Seharga ${total}`,
        },
        {
          headers: {
            Authorization: `Basic ${base64Cred}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(201).json({
        statusCode: 201,
        data: transaction,
        xenditURL: response.data.invoice_url,
        xendit_trx_id: response.data.id,
        transaction_id: transaction.id,
      });
    } catch (error) {
      next(error);
    }
  }

  static async handlePayment(req, res, next) {
    let { trxId, xendit_trx_id } = req.body;

    try {
      const base64Cred = btoa(
        `xnd_development_yw06H7bmg1TjN3aFh4sYkUTTboKMS310nCyS2XBhisSve522hS8vdyU4m2MJZg:`
      );

      const response = await axios.get(
        `https://api.xendit.co/v2/invoices/${xendit_trx_id}`,
        {
          headers: {
            Authorization: `Basic ${base64Cred}`,
          },
        }
      );

      if (response.data.status === "SETTLED") {
        const transaction = await Transaction.findOne({
          where: { id: trxId },
        });

        if (transaction) {
          await WishList.destroy({
            where: {
              carId: transaction.carId,
              userId: transaction.userId,
            },
          });

          await paymentNotification(req.user.email, trxId);

          res.status(200).json({ message: "success" });
        }
      } else {
        return res.status(200).json({
          message: "Payed already!",
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
