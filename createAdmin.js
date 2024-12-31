"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
var bcrypt = require("bcryptjs");
var dotenv = require("dotenv");
var readline = require("readline");
dotenv.config();
var sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});
var User = /** @class */ (function (_super) {
    __extends(User, _super);
    function User() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return User;
}(sequelize_1.Model));
User.init({
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: sequelize_1.DataTypes.STRING,
    email: sequelize_1.DataTypes.STRING,
    password: sequelize_1.DataTypes.STRING,
    role: sequelize_1.DataTypes.STRING,
    // status: DataTypes.STRING,
    adminToken: sequelize_1.DataTypes.STRING,
}, { sequelize: sequelize, modelName: 'user' });
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function askQuestion(query) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return rl.question(query, resolve); })];
        });
    });
}
// Function to validate password complexity
function validatePassword(password) {
    // Regular expression to check for at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,}$/;
    return passwordRegex.test(password);
}
function isValidEmail(email) {
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
function createSingleAdmin() {
    return __awaiter(this, void 0, void 0, function () {
        var existingAdmin, masterPassword, inputPassword, username_1, email_1, confirmEmail, password, confirmPassword, hashedPassword_1, newAdmin, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 15, 16, 18]);
                    return [4 /*yield*/, sequelize.authenticate()];
                case 1:
                    _a.sent();
                    console.log('Database connection established successfully.');
                    return [4 /*yield*/, User.findOne({ where: { role: 'admin' } })];
                case 2:
                    existingAdmin = _a.sent();
                    if (existingAdmin) {
                        console.log('An admin already exists. Cannot create another one.');
                        return [2 /*return*/];
                    }
                    masterPassword = process.env.MASTER_ADMIN_PASSWORD;
                    if (!masterPassword) {
                        console.error('MASTER_ADMIN_PASSWORD is not defined in the environment variables.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, askQuestion('Enter the master password: ')];
                case 3:
                    inputPassword = _a.sent();
                    if (inputPassword !== masterPassword) {
                        console.log('Incorrect master password. Operation canceled.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, askQuestion('Enter the admin username: ')];
                case 4:
                    username_1 = _a.sent();
                    _a.label = 5;
                case 5:
                    if (!true) return [3 /*break*/, 8];
                    return [4 /*yield*/, askQuestion('Enter the admin email: ')];
                case 6:
                    email_1 = _a.sent();
                    if (!isValidEmail(email_1)) {
                        console.log('Please enter a valid email address.');
                        return [3 /*break*/, 5];
                    }
                    return [4 /*yield*/, askQuestion('Confirm the admin email: ')];
                case 7:
                    confirmEmail = _a.sent();
                    if (email_1 === confirmEmail) {
                        return [3 /*break*/, 8];
                    }
                    else {
                        console.log('The emails do not match. Please try again.');
                    }
                    return [3 /*break*/, 5];
                case 8:
                    console.log('Email confirmed:', email_1);
                    password = void 0;
                    _a.label = 9;
                case 9:
                    if (!true) return [3 /*break*/, 12];
                    return [4 /*yield*/, askQuestion('Enter the admin password (must include an uppercase letter, a lowercase letter, a number, and a special character): ')];
                case 10:
                    password = _a.sent();
                    if (!validatePassword(password)) {
                        console.log('The password does not meet the complexity requirements. Please try again.');
                        return [3 /*break*/, 9]; // If the password is invalid, ask for it again
                    }
                    return [4 /*yield*/, askQuestion('Confirm the admin password: ')];
                case 11:
                    confirmPassword = _a.sent();
                    if (password === confirmPassword) {
                        return [3 /*break*/, 12];
                    }
                    else {
                        console.log('The passwords do not match. Please try again.');
                    }
                    return [3 /*break*/, 9];
                case 12: return [4 /*yield*/, bcrypt.hash(password, 10)];
                case 13:
                    hashedPassword_1 = _a.sent();
                    return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, User.create({
                                            username: username_1,
                                            email: email_1,
                                            password: hashedPassword_1,
                                            role: 'admin',
                                            // status: 'active', // Uncomment if you want to set status
                                            // adminToken: , // Uncomment and set if needed
                                            lastProfileUpdate: new Date(),
                                        })];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })()];
                case 14:
                    newAdmin = _a.sent();
                    console.log('Admin created successfully:', newAdmin.username);
                    return [3 /*break*/, 18];
                case 15:
                    error_1 = _a.sent();
                    console.error('Error creating the admin:', error_1);
                    return [3 /*break*/, 18];
                case 16:
                    rl.close();
                    return [4 /*yield*/, sequelize.close()];
                case 17:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 18: return [2 /*return*/];
            }
        });
    });
}
createSingleAdmin();
