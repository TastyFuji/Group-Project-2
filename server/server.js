const express = require("express");
const morgan = require("morgan");
const { readdirSync } = require("fs");
const cors = require("cors");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//const authRouter = require('./routes/auth')
//const categoryRouter = require('./routes/category')

const app = express();
const port = 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

//app.use('/api',authRouter)
//app.use('/api',categoryRouter)

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to MongoDB via Prisma");
  } catch (error) {
    console.error("❌ Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

readdirSync("./routes").map((c) => app.use("/api", require("./routes/" + c)));

app.listen(port, () => console.log(`Start server on port ${port}!`));
