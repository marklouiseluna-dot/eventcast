
const SPREADSHEET_ID = "1YiOzp_NJQcbIWMbfw4hjc67suyu5y4pK0UNQ894HWxk";
const SHEET_NAME = "Sheet1";

function doPost(e) {

  // AVOIDS DOUBLE SUBMISSIONS AT THE SAME TIME
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // READ INCOMING DATA FROM JSON
    const data = JSON.parse(e.postData.contents);

    const eventName = data.event;
    const city = data.city;
    const date = data.date;
    const name = data.name;
    const email = data.email;
    const guests = data.guests;

    const weatherMain = data.weatherMain || "Unknown";
    const weatherDesc = data.weatherDesc || "";
    const temperature = data.temperature || 0;
    const windSpeed = data.windSpeed || 0;

    // GENERATES THE WEATHER ADVISORY
    const advisory = getWeatherAdvisory(weatherMain, temperature, windSpeed);

    // CONNECTS APPSCRIPT TO SPREADSHEETS THEN APPENDS DATA ROWS
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    const newRow = [
      new Date(),
      eventName,
      city,
      date,
      name,
      email,
      guests,
      weatherMain,
      weatherDesc,
      temperature,
      windSpeed,
    ];

    sheet.appendRow(newRow);

    // GOOGLE DOC
    const doc = DocumentApp.create("Ticket - " + name);
    const body = doc.getBody();

    // TITLE
    const title = body.appendParagraph("🎫 EVENT REGISTRATION CONFIRMATION");
    title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    title.setFontSize(20);
    title.setBold(true);

    body.appendParagraph("");

    // DETAILS
    body.appendParagraph("Event: " + eventName).setBold(true);
    body.appendParagraph("City: " + city);
    body.appendParagraph("Date: " + date);
    body.appendParagraph("Name: " + name);
    body.appendParagraph("Email: " + email);
    body.appendParagraph("Guests: " + guests);

    body.appendParagraph("");

    // WEATHER SECTION
    const weatherHeader = body.appendParagraph("🌤️ Weather Forecast");
    weatherHeader.setBold(true);
    weatherHeader.setFontSize(14);

    if (weatherMain.toLowerCase().includes("not yet available")) {
      body.appendParagraph("Forecast will be available within 5 days of the event.");
    } else {
      body.appendParagraph("Condition: " + weatherMain + " (" + weatherDesc + ")");
      body.appendParagraph("Temperature: " + temperature + "°C");
      body.appendParagraph("Wind Speed: " + windSpeed + " m/s");
    }

    body.appendParagraph("");

    // ADVISORY SECTION
    const advisoryHeader = body.appendParagraph("📋 What to Bring / Advisory");
    advisoryHeader.setBold(true);
    advisoryHeader.setFontSize(14);
    const advisoryText = body.appendParagraph(advisory);
    advisoryText.setItalic(true);

    body.appendParagraph("");

    // STATUS SECTION
    const statusHeader = body.appendParagraph("─── Registration Status ───");
    statusHeader.setBold(true);
    statusHeader.setFontSize(12);

    body.appendParagraph("✅ Confirmed");

    doc.saveAndClose();

    // PDF CONVERSION
    const docFile = DriveApp.getFileById(doc.getId());
    const pdfBlob = docFile.getAs("application/pdf");

    // SENDS THE EMAIL
    MailApp.sendEmail({
      to: email,
      subject: "Your Registration Confirmation for " + eventName,
      body: "Hi " + name + ",\n\n" +
            "Thank you for registering for " + eventName + ".\n" +
            "Your registration confirmation is attached as a PDF.\n\n" +
            "Event Details:\n" +
            "City: " + city + "\n" +
            "Date: " + date + "\n" +
            "Guests: " + guests + "\n\n" +
            "Weather Advisory:\n" + advisory + "\n\n" +
            "See you there!\n" +
            "EventCast Team",
      attachments: [pdfBlob],
      replyTo: "marklouiseluna@thelewiscollege.edu.ph"
    });

    docFile.setTrashed(true);

    return ContentService.createTextOutput("Success");
  }

  catch (error) {
    return ContentService.createTextOutput("Error: " + error.message);
  }

  finally {
    lock.releaseLock();
  }
}


function getWeatherAdvisory(condition, temp, wind) {
  const c = condition.toLowerCase();

  // NOT-YET-AVAILABLE FORECAST (event is more than 5 days away)
  if (c.includes("not yet available")) {
    return "📅 The weather forecast will be available within 5 days of the event. Check your email closer to the date for an updated forecast. In the meantime, prepare for typical seasonal conditions.";
  }

  // RAIN, DRIZZLE, THUNDERSTORM
  if (c.includes("rain") || c.includes("drizzle") || c.includes("thunderstorm")) {
    return "🌧️ Bring an umbrella and wear waterproof shoes. Consider a light rain jacket.";
  }

  // SNOW
  if (c.includes("snow") || c.includes("sleet")) {
    return "❄️ Wear warm layers, gloves, and boots. Roads may be slippery.";
  }

  // CLEAR SKY
  if (c.includes("clear")) {
    if (temp > 30) return "☀️ It's going to be hot! Bring water, a hat, and sunscreen.";
    if (temp >= 20) return "🌤️ Pleasant weather expected. Light clothing is recommended.";
    return "🌥️ Cool weather. Bring a light jacket or sweater.";
  }

  // CLOUDS
  if (c.includes("cloud")) {
    if (temp > 30) return "⛅ Warm and cloudy. Stay hydrated and wear breathable clothing.";
    if (temp >= 20) return "⛅ Mild and cloudy. Comfortable for outdoor activities.";
    return "☁️ Chilly and cloudy. Bring a sweater or jacket.";
  }

  // MIST, FOG, HAZE
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) {
    return "🌫️ Low visibility expected. Drive carefully and allow extra travel time.";
  }

  // STRONG WIND
  if (wind > 10) {
    return "💨 Strong winds expected. Secure loose items and avoid open areas.";
  }

  // DEFAULT FALLBACK
  return "📅 The weather forecast will be available within 5 days of the event. Check your email closer to the date for an updated forecast. In the meantime, prepare for typical seasonal conditions.";
}