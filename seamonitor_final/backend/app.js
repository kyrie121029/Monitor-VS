const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');
const cors = require('cors');
const multer = require('multer');
const archiver = require('archiver');
const cron = require('node-cron');
const moment = require('moment');
const nodemailer = require('nodemailer');
const xlsx = require('xlsx');
const nxlsx = require('node-xlsx').default;
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const dataDirectory = path.join(__dirname, 'data');
const uploadDirectory = path.join(__dirname, 'data');
const registerDirectory = path.join(__dirname, 'register');
const loginDirectory = path.join(__dirname, 'register');
const alertDirectory = path.join(__dirname, 'data');

fs.ensureDirSync(uploadDirectory);
fs.ensureDirSync(registerDirectory);

const userFilePath = path.join(registerDirectory, 'user.xlsx');
const adminFilePath = path.join(registerDirectory, 'admin.xlsx');
const waterQualityFilePath =path.join(dataDirectory, '水质数据.xlsx');
const filePath = path.join(__dirname, 'register', 'user.xlsx');

function ensureUserFile() {
  if (!fs.existsSync(userFilePath)) {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet([]);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Users');
    xlsx.writeFile(workbook, userFilePath);
  }
}

ensureUserFile();

// 根路径路由
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Data API</h1><p>Use the API routes to access data.</p>');
});

// 配置 multer 用于注册文件存储
const registerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, registerDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const registerUpload = multer({ storage: registerStorage });

// 用户注册路由
app.post('/api/register', registerUpload.single('avatar'), (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  try {
    const workbook = xlsx.readFile(userFilePath);

    // 打印工作表名称
    console.log('Sheet names:', workbook.SheetNames);

    const sheet = workbook.Sheets['Users'];

    // 打印工作表内容
    console.log('Sheet content:', xlsx.utils.sheet_to_json(sheet));

    const users = xlsx.utils.sheet_to_json(sheet);

    // 添加日志以调试问题
    console.log('Incoming registration data:', { username, email, password });
    console.log('Existing users:', users);

    // 检查用户名和邮箱是否已存在（忽略大小写）
    const userExists = users.some(user =>
      user.Username && user.Email &&
      user.Username.toLowerCase() === username.toLowerCase() &&
      user.Email.toLowerCase() === email.toLowerCase()
    );

    console.log('User exists:', userExists);

    if (userExists) {
      res.status(400).json({ message: 'Username and email already registered' });
      return;
    }

    const newUser = { Username: username, Email: email, Password: password, Avatar: req.file ? req.file.path : null };
    users.push(newUser);

    const updatedSheet = xlsx.utils.json_to_sheet(users);
    workbook.Sheets['Users'] = updatedSheet;
    xlsx.writeFile(workbook, userFilePath);

    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});


// 配置 multer 用于登录存储
const loginStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, loginDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const loginUpload = multer({ storage: loginStorage });


// 登录路由
app.post('/api/login', loginUpload.single('avatar'), (req, res) => {
  const { username, password, type } = req.body;

  if (!username || !password || !type) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  let filePath = '';
  let columnName = '';
  if (type === 'admin') {
    filePath = adminFilePath;
    columnName = 'Adminname';
  } else if (type === 'user') {
    filePath = userFilePath;
    columnName = 'Username';
  } else {
    res.status(400).json({ message: 'Invalid user type' });
    return;
  }

  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[type === 'admin' ? 'Admins' : 'Users'];
    const users = xlsx.utils.sheet_to_json(sheet);

    console.log('Sheet content:', xlsx.utils.sheet_to_json(sheet));
    console.log('Incoming registration data:', { username, password });

    const user = users.find(user => user[columnName] === username && user.Password === password);

    if (user) {
      res.status(200).json({ message: `${type} login successful!` });
    } else {
      res.status(400).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// 读取用户列表
app.get('/api/users', (req, res) => {
  const workSheetsFromFile = nxlsx.parse(fs.readFileSync(filePath));
  const userSheet = workSheetsFromFile[0].data;
  const users = userSheet.slice(1).map(row => ({
    Username: row[0],
    Email: row[1],
    Password: row[2]
  }));
  res.json(users);
});

// 添加用户
app.post('/api/users', (req, res) => {
  const newUser = req.body;
  const workSheetsFromFile = nxlsx.parse(fs.readFileSync(filePath));
  const userSheet = workSheetsFromFile[0].data;
  userSheet.push([newUser.Username, newUser.Email, newUser.Password]);
  const buffer = nxlsx.build([{ name: 'Sheet1', data: userSheet }]);
  fs.writeFileSync(filePath, buffer);
  res.json(newUser);
});

// 删除用户
app.delete('/api/users/:username', (req, res) => {
  const username = req.params.username;
  const workSheetsFromFile = nxlsx.parse(fs.readFileSync(filePath));
  let userSheet = workSheetsFromFile[0].data;
  userSheet = userSheet.filter(row => row[0] !== username);
  const buffer = nxlsx.build([{ name: 'Sheet1', data: userSheet }]);
  fs.writeFileSync(filePath, buffer);
  res.json({ message: 'User deleted successfully' });
});

// 更新用户
app.put('/api/users/:username', (req, res) => {
  const username = req.params.username;
  const updatedUser = req.body;
  const workSheetsFromFile = nxlsx.parse(fs.readFileSync(filePath));
  let userSheet = workSheetsFromFile[0].data;
  userSheet = userSheet.map(row => row[0] === username ? [updatedUser.Username, updatedUser.Email, updatedUser.Password] : row);
  const buffer = nxlsx.build([{ name: 'Sheet1', data: userSheet }]);
  fs.writeFileSync(filePath, buffer);
  res.json(updatedUser);
});


// 配置 multer 用于普通文件上传存储
const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileUpload = multer({ storage: uploadStorage });

// 处理文件上传
app.post('/api/upload', fileUpload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully', file: req.file });
});


// 邮件发送配置
const transporter = nodemailer.createTransport({
  host: 'smtp.163.com',
  port: 465,
  secure: true, // 使用SSL
  auth: {
    user: 'xiaohe_1029@163.com',
    pass: 'YPLKTFYUCVQROBMD' // 使用授权码
  }
});

function sendAlertEmail(userEmail, subject, text, attachmentPath) {
  const mailOptions = {
    from: 'xiaohe_1029@163.com',
    to: userEmail,
    subject: subject,
    text: text,
    attachments: [
      {
        path: attachmentPath
      }
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Error sending email: ', error);
    }
    console.log('Email sent: ' + info.response);
  });
}

// 配置 multer 用于报警
const alertStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, alertDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const alertUpload = multer({ storage: alertStorage });


// 数据异常报警触发端点
app.post('/api/alert',alertUpload.single('file'), (req, res) => {
  try {
    // 模拟生成异常报告
    //const reportPath = path.join(__dirname, '异常报告.pdf'); // 假设异常报告已生成

    const workbook = xlsx.readFile(userFilePath);
    const sheet = workbook.Sheets['Users'];
    const users = xlsx.utils.sheet_to_json(sheet);

    users.forEach(user => {
      sendAlertEmail(
        user.Email,
        '数据异常报警',
        '您的数据出现异常，请查收附件中的异常报告。',
        //reportPath
      );
    });

    res.status(200).json({ message: 'Alert triggered successfully' });
  } catch (error) {
    console.error('Error triggering alert:', error);
    res.status(500).json({ message: 'Error triggering alert' });
  }
});

// 读取Excel文件并返回温度数据的端点
app.get('/api/data', (req, res) => {
  try {
    const filePath = path.join(dataDirectory, 'temperature.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    // 假设温度数据在第一行的 "Temperature" 列中
    const temperature = data[0].Temperature;

    //console.log('Sheet content:', xlsx.utils.sheet_to_json(sheet));

    res.status(200).json({ temperature: temperature });

  } catch (error) {
    console.error('Error reading temperature data:', error);
    res.status(500).json({ message: 'Error reading temperature data' });
  }
});


// 递归读取文件夹中的所有文件
function readFiles(dir) {
  const files = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...readFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  });
  return files;
}

// 处理Excel文件
function processExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
}

// 处理CSV文件
function processCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// 动态生成API路由
async function setupRoutes(files) {
  for (const file of files) {
    const relativePath = path.relative(dataDirectory, file);
    const encodedPath = encodeURIComponent(relativePath).replace(/[!'()*]/g, escape);
    const routePath = `/api/data/${encodedPath}`;

    if (file.endsWith('.xlsx')) {
      app.get(routePath, (req, res) => {
        try {
          const data = processExcelFile(file);
          res.json(data);
        } catch (error) {
          console.error(`Error processing Excel file: ${file}`, error);
          res.status(500).send('Error processing Excel file');
        }
      });
    } else if (file.endsWith('.csv')) {
      app.get(routePath, async (req, res) => {
        try {
          const data = await processCSVFile(file);
          res.json(data);
        } catch (error) {
          console.error(`Error processing CSV file: ${file}`, error);
          res.status(500).send('Error processing CSV file');
        }
      });
    } else {
      console.log(`Skipping unsupported file type: ${file}`);
    }

    console.log(`API route created: ${routePath}`);
  }
}

// 导出数据为ZIP文件
app.get('/api/export', async (req, res) => {
  try {
    const files = readFiles(dataDirectory);
    const zip = archiver('zip', { zlib: { level: 9 } });

    res.attachment('exported_data.zip');

    zip.on('error', (err) => {
      throw err;
    });

    zip.pipe(res);

    for (const file of files) {
      const relativePath = path.relative(dataDirectory, file);
      zip.file(file, { name: relativePath });
    }

    await zip.finalize();
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).send('Error exporting data');
  }
});

// 读取所有文件并设置路由
const files = readFiles(dataDirectory);
setupRoutes(files).then(() => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
});

function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial) + 0.0000001;

  let total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;

  total_seconds -= seconds;

  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;

  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

function processwaterExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  //console.log('Raw Excel data:', data); // 打印原始数据进行调试
  return data.map(item => {
    const excelDate = item['监测时间'];
    const jsDate = excelDateToJSDate(excelDate);
    const formattedDate = moment(jsDate).format('YYYY/M/D');
    item['监测时间'] = formattedDate;
    //console.log(`Processed date: ${item['监测时间']} from ${excelDate}`); // 打印处理后的日期进行调试
    return item;
  });
}

// 获取水质数据的日期列表
app.get('/api/water-quality-dates', (req, res) => {
  try {
    const data = processwaterExcelFile(waterQualityFilePath);
    const uniqueDates = [...new Set(data.map(item => item['监测时间']))];
    res.json(uniqueDates);
  } catch (error) {
    console.error('Error reading water quality dates:', error);
    res.status(500).json({ message: 'Error reading water quality dates' });
  }
});

// 根据日期获取水质数据
app.get('/api/water-quality', (req, res) => {
  try {
    const { date } = req.query;
    console.log(`Received date query: ${date}`); // 调试日志
    const data = processwaterExcelFile(waterQualityFilePath);
    const waterQualityData = data.filter(item => item['监测时间'] === date);
    console.log(`Water quality data found: ${JSON.stringify(waterQualityData)}`); // 调试日志
    if (waterQualityData.length > 0) {
      res.json(waterQualityData);
    } else {
      res.status(404).json({ message: 'No data found for the selected date' });
    }
  } catch (error) {
    console.error('Error reading water quality data:', error);
    res.status(500).json({ message: 'Error reading water quality data' });
  }
});



/*
// 定时重启服务器（每小时）
cron.schedule('0 * * * *', () => {
  console.log('Restarting server...');
  process.exit(0);
});
*/
/*
// 获取并处理鱼类种群数据的端点
app.get('/api/fish-population', (req, res) => {
  try {
    const mainStemData1957To1999 = processExcelFile(path.join(dataDirectory, 'Ohio-River-main-stem-fish-population-data-1957-1999.xlsx'));
    const mainStemData2000To2009 = processExcelFile(path.join(dataDirectory, 'Ohio-River-main-stem-fish-population-data-2000-2009.xlsx'));
    const tributaryData1957To2016 = processExcelFile(path.join(dataDirectory, 'Ohio-River-tributary-fish-population-data-excluding-main-stem-Ohio-River-1957-2016.xlsx'));
    const orsancoData2010To2023 = processExcelFile(path.join(dataDirectory, 'ORSANCO-Fish-Population-Data-2010-2023.xlsx'));

    // Combine data and process it according to your needs
    const combinedData = [
      ...mainStemData1957To1999,
      ...mainStemData2000To2009,
      ...tributaryData1957To2016,
      ...orsancoData2010To2023
    ];

    res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error reading fish population data:', error);
    res.status(500).json({ message: 'Error reading fish population data' });
  }
});
*/
