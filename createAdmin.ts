import { Sequelize, Model, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
    }
);

class User extends Model {
    public userId!: number;
    public username!: string;
    public email!: string;
    public password!: string;
    public role!: string;
    public status!: string;
    public adminToken?: string;
}

User.init({
    userId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    status: DataTypes.STRING,
    adminToken: DataTypes.STRING,
}, { sequelize, modelName: 'user' });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function askQuestion(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}

// Function to validate password complexity
function validatePassword(password: string): boolean {
    // Regular expression to check for at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,}$/;
    return passwordRegex.test(password);
}

async function createSingleAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Check if an admin already exists
        const existingAdmin = await User.findOne({ where: { role: 'admin' } });
        if (existingAdmin) {
            console.log('An admin already exists. Cannot create another one.');
            return;
        }

        // Use the MASTER_ADMIN_PASSWORD variable
        const masterPassword = process.env.MASTER_ADMIN_PASSWORD;
        if (!masterPassword) {
            console.error('MASTER_ADMIN_PASSWORD is not defined in the environment variables.');
            return;
        }

        const inputPassword = await askQuestion('Enter the master password: ');
        if (inputPassword !== masterPassword) {
            console.log('Incorrect master password. Operation canceled.');
            return;
        }

        const username = await askQuestion('Enter the admin username: ');

        // Email validation
        function isValidEmail(email: string): boolean {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailPattern.test(email);
        }
        
        let email: string;
        while (true) {
            email = await askQuestion('Enter the admin email: ');
            if (!isValidEmail(email)) {
                console.log('Please enter a valid email address.');
                continue;
            }
            
            const confirmEmail = await askQuestion('Confirm the admin email: ');
            if (email === confirmEmail) {
                break;
            } else {
                console.log('The emails do not match. Please try again.');
            }
        }
        
        console.log('Email confirmed:', email);
        

        // Password validation
        let password: string;
        while (true) {
            password = await askQuestion('Enter the admin password (must include an uppercase letter, a lowercase letter, a number, and a special character): ');
            
            if (!validatePassword(password)) {
                console.log('The password does not meet the complexity requirements. Please try again.');
                continue; // If the password is invalid, ask for it again
            }

            const confirmPassword = await askQuestion('Confirm the admin password: ');
            if (password === confirmPassword) {
                break;
            } else {
                console.log('The passwords do not match. Please try again.');
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // const adminToken = crypto.randomBytes(32).toString('hex');
        // const hashedAdminToken = await bcrypt.hash(adminToken, 10);

        const newAdmin = await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'admin',
            status: 'active',
            //adminToken: ,
            lastProfileUpdate: new Date(),
        });

        console.log('Admin created successfully:', newAdmin.username);
        //console.log('Admin token generated (store it safely):', adminToken);

    } catch (error) {
        console.error('Error creating the admin:', error);
    } finally {
        rl.close();
        await sequelize.close();
    }
}

createSingleAdmin();