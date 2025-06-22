import dotenv from 'dotenv';
import connectDb from "./db/index.js";
import { User } from "./models/user.model.js";
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import automail from './certificate.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({
    path: './.env'
});

// Connect to the database
connectDb();

automail();
