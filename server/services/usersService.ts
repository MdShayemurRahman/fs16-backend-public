import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepo from '../models/UserModel';
import RoleRepo from '../models/RoleModel';
import { CreateUserInput, User, UserUpdate } from '../types/User';

async function findAll() {
  const users = await UserRepo.find().exec();
  return users;
}

async function getSingleUser(index: string) {
  const id = new mongoose.Types.ObjectId(index);
  const user = await UserRepo.findById(id);
  return user;
}

async function createUser(user: CreateUserInput) {
  const newUser = new UserRepo(user);
  await newUser.save();
  return newUser;
}

async function updateUser(index: string, user: UserUpdate) {
  const updatedUser = await UserRepo.findOneAndUpdate({ _id: index }, user, {
    new: true,
  });
  return updatedUser;
}

async function deleteUser(index: string) {
  const deletedUser = await UserRepo.findOneAndDelete({ _id: index });
  return deletedUser;
}

async function signUp(
  name: string,
  email: string,
  password: string,
  roleId: string
) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new UserRepo({ name, email, roleId, password: hashedPassword });
  await user.save();
  const foundRole = await RoleRepo.findById({ _id: user.roleId });
  if (!foundRole) {
    return null;
  }
  const newUser = { name, email, roleId: foundRole.name };
  return newUser;
}

async function logIn(email: string, password: string) {
  const foundUser = await UserRepo.findOne({ email: email });

  if (!foundUser || !foundUser.password) {
    return null;
  }
  const isValid = bcrypt.compareSync(password, foundUser.password);
  if (!isValid) {
    return null;
  }
  const foundRole = await RoleRepo.findById({ _id: foundUser.roleId });
  console.log('found:', foundRole?.permissions);
  if (!foundRole) {
    return null;
  }
  const payload = {
    email: foundUser.email,
    role: foundRole.name,
    permissions: foundRole.permissions,
  };

  const accessToken = jwt.sign(payload, process.env.TOKEN_SECRET as string, {
    expiresIn: '1h',
  });

  return accessToken;
}

async function googleLogin(user: User) {
  const foundRole = await RoleRepo.findById({ _id: user.roleId });
  if (user && foundRole) {
    const payload = {
      email: user.email,
      role: foundRole.name,
    };
    const accessToken = jwt.sign(payload, process.env.TOKEN_SECRET as string, {
      expiresIn: '1h',
    });
    return accessToken;
  }
  return null;
}

export default {
  findAll,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
  signUp,
  logIn,
  googleLogin,
};
