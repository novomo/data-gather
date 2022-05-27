/*
    Mongo Data Models and Connection
*/
// node modules
const Mongoose = require("mongoose");

// determine if testing or production database should be used
let db;
if (process.env.NODE_ENV === "production") {
  db = process.env.MONGO_DATABASE;
} else {
  db = process.env.MONGO_TEST_DATABASE;
}

Mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-da2eh.mongodb.net/${db}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
);

const UserSchema = Mongoose.Schema({
  // eslint-disable-line
  nme: {
    required: true,
    type: String,
  },
  surname: {
    required: true,
    type: String,
  },
  level: {
    required: true,
    type: Number,
  },
  email: {
    required: true,
    type: String,
  },
  passwrd: {
    required: true,
    type: String,
  },
  accessToken: {
    required: false,
    type: String,
  },
  tracker: {
    required: false,
    type: String,
  },
  accounts: [
    {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  ],
  flashTasks: [
    {
      task: {
        type: String,
        required: true,
        _id: false,
      },
      createdAt: {
        type: Number,
        required: true,
      },
    },
  ],
  coveringLetter: {
    require: false,
    type: String,
  },
  cv: {
    require: false,
    type: String,
  },
  profileImage: {
    require: false,
    type: String,
  },
  logoImage: {
    require: false,
    type: String,
  },
  socialBlurb: {
    require: false,
    type: String,
  },
  industryLabels: [String],
  notificationSettings: {
    betting: [String],
    trading: [String],
    task: [String],
  },
  workTags: [String],
  unitSize: {
    required: false,
    type: Number,
  },
  working: {
    required: false,
    type: Boolean,
  },
  busy: {
    required: false,
    type: Boolean,
  },
});

module.exports.User = Mongoose.model("User", UserSchema);
