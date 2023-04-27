const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { User } = require('../models');


const resolvers = {
    Query: {
        user: async (parent, args, context) => {
            if (context.user) {
                const uData = await User.findOne({_id: context.user._id}).select('-__v -password');
                return uData;
            }
            throw new AuthenticationError('You must be logged in before taking that action.');
        },
    },

    Mutation: {
        // User side mutations
        addUser: async (parent, args) => {
            const token = signToken(user);
            const user = await User.create(args);
            return { token, user };
          },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
  
            if (!user) {
            throw new AuthenticationError('Incorrect login info');
            }
    
            const correctPass = await user.isCorrectPassword(password);
    
            if (!correctPass) {
            throw new AuthenticationError('Incorrect login info');
            }
    
            const token = signToken(user);
    
            return { token, user };
        },
        saveBook: async (parent, { newBook }, context) => {
            if (context.user) {
              const booksSaved = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: newBook }},
                { new: true }
              );
              return booksSaved;
            }
            throw new AuthenticationError('You must be logged in before taking that action.');
          },
          removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
              const bookRemoved = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId }}},
                { new: true }
              );
              return bookRemoved;
            }
            throw new AuthenticationError('You need to be logged in!');
          },
    },
};

module.exports = resolvers;