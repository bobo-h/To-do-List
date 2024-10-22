const User = require("../model/User");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const userController = {};

userController.createUser = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "이미 가입된 이메일 입니다." });
    }
    if (password !== passwordConfirm) {
      return res.status(400).json({ error: "비밀번호가 일치하지 않습니다." });
    }
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(200).json({ message: "회원가입이 성공적으로 완료되었습니다." });
  } catch (error) {
    res.status(400).json({ status: "fail", error });
  }
};

userController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }, "-createdAt -updatedAt -__v");
    if (user) {
      const isMatch = bcrypt.compareSync(password, user.password);
      if (isMatch) {
        const token = user.generateToken();
        return res.status(200).json({ status: "success", user, token });
      }
    }
    return res
      .status(400)
      .json({ error: "이메일 또는 비밀번호를 다시 확인해주세요" });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = userController;
