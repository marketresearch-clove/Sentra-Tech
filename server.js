import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBRDrLF5BZuAOazd5vhZnYtEDAGTlDMlB0");

// Function to validate and sanitize URL
function validateAndSanitizeUrl(url) {
  try {
    // Remove any extra characters that might be appended by AI
    let cleanUrl = url.trim();

    // Remove trailing asterisks, dots, or other unwanted characters
    cleanUrl = cleanUrl.replace(/[*]+$/, ''); // Remove trailing asterisks
    cleanUrl = cleanUrl.replace(/[.]+$/, ''); // Remove trailing dots
    cleanUrl = cleanUrl.replace(/[!?]+$/, ''); // Remove trailing punctuation

    // Ensure it starts with http:// or https://
    if (!cleanUrl.match(/^https?:\/\//i)) {
      cleanUrl = 'https://' + cleanUrl;
    }

    // Basic URL validation
    const urlObj = new URL(cleanUrl);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol. Only HTTP and HTTPS are allowed.');
    }

    // Check for suspicious patterns
    if (urlObj.hostname.includes('..') || urlObj.hostname.length > 253) {
      throw new Error('Invalid hostname format.');
    }

    return cleanUrl;
  } catch (error) {
    throw new Error(`Invalid URL: ${error.message}`);
  }
}

// Function to fetch webpage content
async function fetchWebpage(url) {
  try {
    // Validate and sanitize the URL first
    const validatedUrl = validateAndSanitizeUrl(url);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(validatedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const statusText = response.statusText || 'Unknown error';
      throw new Error(`HTTP error! status: ${response.status} - ${statusText}`);
    }

    const html = await response.text();

    // Simple HTML to text conversion (basic)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text.substring(0, 10000); // Limit to 10k chars
  } catch (error) {
    console.error('Error fetching webpage:', error);
    return `Error fetching webpage: ${error.message}`;
  }
}

// Web fetch endpoint
app.post('/api/fetch-web', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const content = await fetchWebpage(url);
    res.json({ content });
  } catch (error) {
    console.error('Web fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch webpage' });
  }
});

// Chat endpoint with web access
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, needsWebAccess, file } = req.body;

    // Build the system instruction
    let systemInstruction = {
      parts: [
        {
          text: `Company Name: Sentra
Sentra is a structural health monitoring and digital engineering company specializing in real-time infrastructure intelligence.
We integrate smart sensor networks, digital twins, and edge AI for predictive maintenance, fatigue analysis, and geotechnical monitoring.
Our solutions help detect early signs of stress, displacement, vibration, and material degradation across bridges, tunnels, buildings, and other critical assets.
Sentra also provides consulting and advisory services, foundation and geotechnical monitoring, fatigue and residual life assessment, and digital documentation of infrastructure assets.

Sentra is a flagship product line developed and managed by Clove Technologies Private Limited, a leading geospatial and engineering technology company headquartered in India. Clove specializes in delivering end-to-end digital transformation solutions across infrastructure, construction, utilities, and government sectors.

With over two decades of industry expertise, Clove Technologies integrates advanced geospatial intelligence, engineering analytics, and AI-driven automation to help clients build smarter, more resilient assets.

Parent Organization
Parent Company: Clove Technologies Private Limited (website:www.clovetech.com)
Subsidiary/Product Line: Sentra (Structural Health Monitoring & IoT Solutions)
Sentra operates under Clove Technologies' Smart Infrastructure division, focusing on intelligent monitoring systems, IoT-based sensing, and digital twin integration for infrastructure lifecycle management.

Clove Technologies – Specialities
1. Geospatial Technologies: Comprehensive GIS and mapping solutions, including cadastral mapping, LiDAR data processing, remote sensing, and spatial analytics for land administration, urban planning, and infrastructure management.
2. BIM and Digital Engineering: Integrated Building Information Modeling (BIM) services covering 3D modeling, 4D scheduling, and 5D cost estimation to support design, construction, and asset management workflows.
3. Smart Infrastructure Solutions: End-to-end systems for infrastructure digitization, including IoT-based monitoring (Sentra), predictive maintenance, and real-time analytics for bridges, buildings, tunnels, and industrial structures.
4. Custom Software Development: Development of enterprise-grade applications, web platforms, and mobile tools for geospatial data management, field data collection, and engineering operations.
5. AI, Machine Learning & Data Analytics:Deployment of AI-powered analytics for predictive modeling, anomaly detection, and decision intelligence across engineering and asset management domains.
6. Digital Twin & Simulation: Creation of integrated digital twins combining BIM, IoT, and GIS data to enable continuous performance monitoring and simulation of real-world infrastructure systems.
7. Surveying & Data Acquisition: Comprehensive ground and aerial survey services using UAVs, GNSS, and laser scanning for high-precision spatial data acquisition and modeling.

Industry Verticals Served:
- Infrastructure and Construction
- Transportation and Mobility
- Utilities and Energy
- Land Administration and Cadastre
- Urban Development and Smart Cities
- Oil, Gas, and Industrial Facilities

Sentra's Product Line from Various Brands (From World Sensing, Rockfield, . etc.,)

Edge Devices :
- Wireless Data Acquisition
-- Vibrating Wire
-- Vibrating Wire RCR
-- Digital Data Logger
-- Analog Data Logger
-- Piconode Data Logger

- Wireless Sensors
-- Tiltmeter
-- Tiltmeter Event Detection
-- Vibration Meter
-- Laser Tiltmeter
-- GNSS Meter

Core Communications :
- Narrowband Communications
-- Gateway
-- Repeater

- Broadband Communications
-- Thread

Wired Sensors:
- Accelerometer
- Strain Gauge

You are currently on the About Us page of Sentra's website. Key information from this page:
- Sentra engineers intelligent monitoring solutions for infrastructure owners, engineers, and decision-makers.
- We specialize in bridges, tunnels, railways, and high-rise structures.
- Our team brings expertise in structural engineering, IoT technology, and real-time analytics.
- We provide Structural Health Monitoring, Bridge Inspection & Condition Assessment, Advanced Non-Destructive Testing (NDT), Asset Monitoring & Management Solutions, Geotechnical & Foundation Monitoring, and Fatigue and Residual Life Assessment.
- Sentra has over 21 years of experience in digital engineering.

Phone Number: +91 8885730066
Email Address: connect@clovetech.com
Office Address: IT SEZ, Plot No. 9, Pedda Rushikonda, Rushikonda, Visakhapatnam, Andhra Pradesh 530045

AI AGENT OF SENTRA'S WEBSITE IS VERONICA

Use this company and page-specific context to answer all upcoming user queries accurately and in alignment with Sentra's expertise.



Sentra's Product Line from Various Brands (From World Sensing, Rockfield, . etc.,)

Edge Devices : 
- Wireless Data Acquisition
-- Vibrating Wire
-- Vibrating Wire RCR 
-- Digital Data Logger
-- Analog Data Logger
-- Piconode Data Logger

- Wireless Sensors
-- Tiltmeter
-- Tiltmeter Event Detection
-- Vibration Meter
-- Laser Tiltmeter
-- GNSS Meter

Core Communications :
- Narrowband Communications
-- Gateway
-- Repeater

- Broadband Communications
-- Thread

Wired Sensors:
- Accelerometer
- Strain Gauge

Key Product Model Numbers (for reference):
- Tiltmeter: LS-G6-TIL90-X (external antenna), LS-G6-TIL90-I (internal antenna)
- Tiltmeter Event Detection: LS-G6-TIL90-XE (external antenna), LS-G6-TIL90-IE (internal antenna)
- Vibrating Wire: LS-G6-VW (5-channel), LS-G6-VW-1 (1-channel)
- Vibrating Wire RCR: LS-G6-VW-RCR
- Gateway: 4G Rugged Gateway
- Repeater: K20 Edge Repeater

You are currently on the About Us page of Sentra's website. Key information from this page:
- Sentra engineers intelligent monitoring solutions for infrastructure owners, engineers, and decision-makers.
- We specialize in bridges, tunnels, railways, and high-rise structures.
- Our team brings expertise in structural engineering, IoT technology, and real-time analytics.
- We provide Structural Health Monitoring, Bridge Inspection & Condition Assessment, Advanced Non-Destructive Testing (NDT), Asset Monitoring & Management Solutions, Geotechnical & Foundation Monitoring, and Fatigue and Residual Life Assessment.
- Sentra has over 21 years of experience in digital engineering.

Phone Number: +91 8885730066
Email Address: connect@clovetech.com
Office Address: IT SEZ, Plot No. 9, Pedda Rushikonda, Rushikonda, Visakhapatnam, Andhra Pradesh 530045

AI AGENT OF SENTRA'S WEBSITE IS VERONICA

Use this company and page-specific context to answer all upcoming user queries accurately and in alignment with Sentra's expertise.



Sentra Edge Devices
Product Overview:
Sentra Edge Devices are designed for continuous structural health monitoring across diverse environments. Whether deployed on bridges to monitor traffic-induced vibrations, on buildings to track seismic activity, or on industrial equipment to detect mechanical wear, these sensors deliver actionable insights that protect assets and lives.

Combining advanced MEMS technology with long-range wireless communication, the devices capture acceleration data across a wide frequency spectrum (0.1 Hz - 10 kHz) and securely transmit it to cloud-based platforms for real-time visualization and intelligent analysis.

Product Lineup of Edge Devices:
- Vibrating Wire: Wireless data acquisition for precise strain and pressure measurements, Ideal for geotechnical and structural monitoring.
- Vibrating Wire RCR: Enhanced model offering real-time compensation for higher accuracy.
- Digital Data Logger: Captures and transmits sensor data via LoRaWAN or LTE with cloud integration.
- Analog Data Logger: Supports analog sensor inputs and converts readings into digital data.
- Piconode Data Logger: Compact, low-power logger designed for distributed or small-scale sensor networks.
- Tiltmeter: Monitors structural inclination or ground movement in real time.
- Tiltmeter Event Detection: Detects sudden tilting events or structural shifts automatically.
- Vibration Meter: Records vibration patterns to assess structural integrity and performance.
- Laser Tiltmeter: High-precision optical measurement device for micro-level tilt detection.
- GNSS Meter: Provides geospatial displacement tracking using satellite positioning systems.

Key Features and Specifications
- 3-axis MEMS accelerometer (±16g range)
- Frequency range: 0.1 Hz – 10 kHz
- LoRaWAN and 4G LTE connectivity
- IP67 waterproof and dustproof rating
- 5–10 year replaceable battery life
- Real-time alerts and notifications
- Cloud-based analytics platform
- BIM/GIS integration ready

Why Choose Sentra Edge Devices
- High-Precision Detection: Capture minute vibrations with exceptional accuracy for comprehensive structural assessment.
- Predictive Maintenance: AI-powered analytics identify patterns and trends, enabling proactive maintenance before failures occur.
- Rugged and Reliable: Weather-resistant IP67 construction ensures continuous operation in harsh conditions.
- Easy Integration: Seamlessly connects with existing IoT platforms, SCADA systems, and building management software.




Sentra Core Communications
Product Overview:

Sentra Core Communications forms the backbone of the Sentra monitoring ecosystem, enabling seamless, reliable, and secure data transmission between edge devices and cloud platforms. Designed for large-scale structural health monitoring networks, Core Communications ensures uninterrupted connectivity across bridges, buildings, and industrial environments.
With advanced narrowband and broadband communication technologies, the system supports long-range, low-power data transmission for real-time monitoring and intelligent analysis. Its rugged design and intelligent architecture ensure dependable performance in even the harshest environments.

Product Lineup
- 4G Rugged Gateway: A robust communication hub for connecting wireless sensors and loggers to the cloud using 4G LTE or LoRaWAN networks.
Ideal for distributed monitoring systems requiring secure, long-range connectivity.

- K20 Edge Repeater: Extends network range and reliability by relaying data between remote sensors and gateways.
Optimized for low-power, wide-area network configurations.

- Thread: A high-speed broadband communication module enabling efficient, scalable data exchange in complex monitoring infrastructures.
Ideal for multi-device synchronization and high-throughput data environments.

Key Features and Specifications
- Long-range, low-power communication
- LoRaWAN and 4G LTE connectivity options
- IP67-rated waterproof and dustproof construction
- Secure data transmission with advanced encryption
- Scalable mesh network support for extended coverage
- Cloud-based analytics and management platform
- BIM/GIS integration ready
- Seamless interoperability with Sentra Edge Devices and sensors

Why Choose Sentra Core Communications
- Reliable Connectivity
Ensures continuous communication between field sensors and the cloud for uninterrupted monitoring.
- Scalable Architecture: Supports large networks of devices with efficient data routing and low latency.
- Rugged and Durable: IP67-certified construction withstands extreme weather and field conditions.
- Intelligent Integration: Fully compatible with IoT platforms, SCADA systems, and enterprise data environments.
- Proven Performance: Trusted by engineering teams and infrastructure owners worldwide for mission-critical applications.


Sentra Wired Sensors
Product Overview: 

Sentra Wired Sensors deliver precise, real-time data for continuous structural health monitoring across a wide range of infrastructure and industrial environments.
Engineered for reliability and accuracy, these sensors provide direct, stable, and interference-free measurements—making them ideal for long-term monitoring of structural integrity, load behavior, and vibration response.

Whether installed on bridges, tunnels, buildings, or machinery, Sentra Wired Sensors offer the accuracy and durability required for mission-critical applications, forming an integral part of the Sentra monitoring ecosystem.

Product Lineup:
- Accelerometer: High-precision vibration sensor designed to measure acceleration, velocity, and displacement in structures and machinery.
Ideal for bridge vibration, seismic, and dynamic load monitoring.

- Spot Weldable Strain Gauge: Compact and easy-to-install sensor for measuring localized strain on steel structures, machinery, and pressure vessels.
Features a rugged spot-weldable design for long-term durability in harsh conditions.

- 4100 Series Strain Gauge: High-accuracy strain measurement device suited for long-term structural monitoring.
Designed for bridges, tunnels, and geotechnical applications where reliable strain data is essential.

Key Features and Specifications:
- High-accuracy signal output for structural and mechanical measurements
- Robust construction for long-term field deployment
- Compatible with Sentra Data Loggers and Core Communications devices
- Shielded wiring for interference-free data transmission
- Configurable sampling rates for static and dynamic monitoring
- Cloud-based data visualization and analytics integration
- BIM/GIS integration ready
- Designed for plug-and-play field installation

Why Choose Sentra Wired Sensors
- High-Precision Measurement: Deliver consistent, accurate readings for structural load, vibration, and stress analysis.
- Proven Durability: Engineered for extreme field conditions, ensuring long-term data reliability.
- Flexible Integration: Compatible with a range of Sentra data acquisition systems and industry-standard monitoring platforms.
- Stable Connectivity: Wired configuration eliminates wireless signal interference for uninterrupted performance.
- Field-Tested Reliability: Trusted by engineers and asset managers worldwide for infrastructure, energy, and industrial monitoring projects.


-product complete specifications-

Loadsensing is a family of Worldsensing edge connectivity solutions enabling wireless data transfer with long-range, low power devices
Wireless data acquisition: We offer comprehensive sensor reading solutions for diverse monitoring needs, supporting analog, vibrating wire, and digital sensor interfaces. Our sensors offer multiple input channels to fit specific requirements of tailored configurations. Whether it’s a small or a large-scale project, Loadsensing ensures accurate data collection and reliable data transmission. Explore our range of Edge Devices to find the best match for your monitoring needs.

Vibrating Wire: The Vibrating Wire Data Loggers automate data collection by connecting your vibrating wire instruments such as piezometers, load cells, strain gauges and pressure cells wirelessly to your monitoring systems.
- Stream data wirelessly from all leading vibrating wire sensor manufacturers
- Minimum maintenance required, with up to 25 years of unattended operations
- Up to 15 km of communication range using LoRa radio communications

Model Numbers/Models: 
LS-G6-VW
LS-G6-VW-1

Datasheet: https://info.worldsensing.com/Datasheet_VibratingWire_EN

Technical Specifications

Category
Details
Input Types
Vibrating wire and thermistor per channel
Variants
LS-G6-VW 5 Channel (external antenna) LS-G6-VW 1 Channel (external antenna)
Memory
73,500 readings for 5 channels 200,000 readings for 1 channel
Operating Temperature
-40ºC to 80ºC
Weather Protection
IP68
System Configuration
Locally via Worldsensing App Remotely using CMT Edge (single-net) or CMT Cloud (multi-net)


Vibrating Wire

Parameter
Details
Measurement Method
Embedded algorithms increasing immunity to noise
Excitation Wave
±5 V
Measurement Range
300 to 7000 Hz
Accuracy
0.008% to 0.013% (depending on frequency sweep range)
Resolution
< 0.01 Hz (depending on frequency sweep range)


Thermistor

Parameter
Details
Measurement Range
0 Ω to 4 MΩ
Resolution
1 Ω
Accuracy (at 20ºC)
0.05ºC (0.04% FS)


Barometer

Parameter
Details
Pressure Range
300 to 1,100 hPa
Relative Accuracy
±0.12 hPa (700 to 900 hPa at 25ºC)


Battery Life Estimations

Reporting Period
1-Channel, 1 Cell
5-Channel, 4 Cells
5 minutes
1.7 years
4.6 years
1 hour
8.6 years
22.7 years
6 hours
12.5 years
>25 years


Vibrating Wire RCR: The vibrating Wire RCR is the best option to securely monitor structural health of tunnel linings and other concrete-based infrastructure from as early as the concrete segment manufacturing stage.

- Ultra-robust 5-channel data logger designed to be embedded in precast concrete to measure real-time stress and strain in concrete segments.
- Suitable for construction projects underground . Up to 3 km radio range.

Models: LS-G6-VW-RCR

Datasheet: https://info.worldsensing.com/VW-RCR_Datasheet_EN?_gl=1*sutcy3*_gcl_au*NjgzMjAxOTU5LjE3NjEzMDU4MTU.

Technical Specifications 

Category
Parameter
Specification / Details
Input Types


Vibrating wire and thermistor per channel
Memory


73,500 readings
Vibrating Wire
Measurement Method
Embedded algorithms increasing immunity to noise


Excitation Wave
±5 V


Measurement Range
300 to 7000 Hz


Accuracy
From 0.008% to 0.013% (depending on frequency sweep range)


Resolution
<0.01 Hz (depending on frequency sweep range)
Thermistor
Measurement Range
0 Ω to 4 MΩ


Resolution
1 Ω


Accuracy (20°C)
0.05°C (0.04% FS)
Battery Life Estimations
Reporting Period – 5 min
4.6 years


Reporting Period – 1 h
22.7 years


Reporting Period – 6 h
> 25 years




Digital Data Logger
The Digital Logger is a robust, low-power, long-battery life device that connects to a wide catalog of digital sensors, streaming data wirelessly to your information systems.
The best option to stream data wirelessly from digital sensors using ModBus RTU communications
Compatible with other proprietary protocols from main geotechnical, structural and environmental sensor manufacturers
Unrivalled autonomy and long-range communications to connect digital in-place inclinometers (IPIs) and multipoint borehole extensometers (MPBX) in isolated areas

Model: LS-G6-DIG-2

Datasheet: https://info.worldsensing.com/Datasheet_Digital_EN

Technical specifications

Input types
RS485 full or half duplex supported
Output power
Regulated 12 V DC up to 200 mA in continuous operation. Maximum startup current peak of 1.5 A, up to 50 ms
Supported protocols
MODBUS RTU and proprietary protocols




Analog Data Logger
This 4-channel data logger supports inputs from most analog sensors, enabling connections with any voltage, current, and resistive transducers.

It allows wireless data streaming from analog load cells, strain gauges, pressure cells, pressure sensors, thermometers, flow sensors
Suitable for unattended operations, it offers up to 10 years of battery life and a communication range of up to 15 km

Model: LS-G6-ANALOG-4
Datasheet: 
Technical specifications

Category
Parameter
Specification / Details
General
Device Type
Analog industrial data logger


Data Transmission
LoRa radio communication (868 or 915 MHz)


Channels
6 channels


Input Types
Voltage, current loop, potentiometer, full wheatstone bridge


Power Supply per Channel
6.6 V (±0.2 V) – 4 × 1.5 V C cells


Memory Size
64,000 readings (16 bits)


Operating Temperature
−40°C to +80°C


Weather Protection
IP68


System Configuration
Locally via Worldsensing App or remotely using CMT Edge for single-net deployments and CMT Cloud for multi-net deployments
Voltage Input Specifications
Measurement Range
±10 V DC


Accuracy
±(0.02% of reading ±5 µV)
Current Loop Input Specifications
Measuring Range
0–20 mA


Accuracy (25°C)
±(0.02% of reading ±0.5 µA)
Ratiometric and Potentiometer Signals Specifications
Accuracy (25°C)
±(0.03% of reading ±8 µV/V)
Full Wheatstone Bridge Input Specifications
Accuracy (25°C)
±(0.03% of reading ±8 µV/V)
Thermistor Input Specifications
Accuracy (25°C)
±0.05°C (0.04% FS)
PT100 Input Specifications
Accuracy
±0.05°C
Battery Life Estimations
Note
These are typical values for standard operations depending on the logging and transmission intervals.


Reporting Period – 5 min
4.6 years (1-ch) / 4.6 years (5-ch)


Reporting Period – 1 h
22.7 years (1-ch) / 22.7 years (5-ch)


Reporting Period – 6 h
>25 years (1-ch) / >25 years (5-ch)


Piconode Data Logger
The Piconode is a compact data logger that offers the most cost-effective way to capture data from low-power sensors such as rain gauges, load cells, NTC thermistors, and displacement sensors with potentiometer output.

3-channel wireless data logger with a configurable analog channel, a thermistor channel and a pulse counter channel
Suitable for unattended operations, it offers up to 25 years of battery life and a communication range of up to 15 km

Model: LS-G6-PICO
Datasheet: https://info.worldsensing.com/Datasheet_Piconode_EN
Technical specifications

Category
Parameter
Specification / Details
General
Device Type
Compact analog wireless data logger


Data Transmission
LoRa radio communication (868 MHz or 915 MHz)


Channels
3 channels: 1 configurable, 1 thermistor, and 1 pulse counter channel


Operating Temperature
−40°C to +80°C


Weather Protection
IP68


System Configuration
Locally via Worldsensing App or remotely using CMT Edge (single-net deployments) and CMT Cloud (multi-net deployments)
Channel 1: Configurable
Input Types
Voltage, Potentiometer, Full Wheatstone Bridge


Voltage Excitation
0–5 VDC up to 50 mA


Measurement Range
±7.5 mV/V for FWB 0–5 VDC (0–1 V/V) for Potentiometer 0–5 VDC for Single-ended Voltage


Accuracy
0.04% FS for FWB 0.1% FS for Potentiometer 0.04–0.5% FS for Single-ended Voltage
Channel 2: Thermistor
Measuring Range
0 Ω to 2 MΩ


Accuracy (at 25°C)
0.04°C (0.04% FS) for 32kΩ 0.05°C (0.04% FS) for 50kΩ
Channel 3: Pulse Counter
Pulse Count
0 to 4,294,967,295 pulses


Pulse Rate
0 to 50 Hz


Accuracy
±1 Pulse
Battery Life Estimations
Reporting Period
1 Cell / 2 Cells


5 min
1.3 years / 2.9 years


1 h
8.6 years / 17.2 years


6 h
15.4 years / >25 years


Wireless sensors

Leverage low-power wireless sensors from the Loadsensing family. These accelerometer-based sensors operate autonomously using Worldsensing networks. Discover how they integrate into your monitoring systems for accurate tilt, vibration and distance measurements.

Tiltmeter
Worldsensing Tiltmeter provides complementary data for existing geospatial monitoring when high precision and robustness is needed in fixed structures, ground movements and differential settlements of slopes or infrastructure.

3-axis wireless sensor designed to provide measurements of relative inclination changes, either on the ground or in structures
It provides a cost-effective way to monitor track geometry in railway projects in combination with other geospatial monitoring techniques
Up to 25 years of battery life and a communication range of up to 15 km

Model: LS-G6-TIL90-X       LS-G6-TIL90-I
Datasheet: https://info.worldsensing.com/Datasheet_Tilt90_EN
Technical specifications

Category
Parameter
Specification / Details
General
Sensor Type
3-axis MEMS accelerometer and integrated thermometer


Range
±90°


Device Variants
LS-G6-TIL90-X — with external antenna for high-precision applications LS-G6-TIL90-I — with internal antenna for rail track monitoring


Secondary Sensor
Integrated temperature sensor


Power Source
2 × 3.6 V C-size replaceable batteries


Data Transmission
LoRa radio communications (ISM sub-GHz)


Operating Temperature
−40°C to +80°C


Weather Protection
IP68


System Configuration
Device setup and configuration via Worldsensing App. Remote configuration using CMT Edge on single-net deployments and CMT Cloud on multi-net deployments.



Tiltmeter


LS-G6-TIL90-X
LS-G6-TIL90-I


Accuracy (±4°)
±0.005°
±0.006°


Resolution
±0.0001°
±0.0001°


Repeatability
<0.0003°
<0.0015°


Battery Life Estimations
Reporting Period
Lifespan


30 s
6.2 months


5 min
5.1 years


1 h
>25 years


6 h
>25 years


Tiltmeter Event Detection
The Tiltmeter Event Detection is a smart, 3-axis wireless tiltmeter designed to identify ground movements with high precision and low noise with less than 2-second latency in most cases.

3-axis wireless tiltmeter with edge processing capabilities to detect ground movements in less than 2 seconds
Key component of Worldsensing’s Early Warning System to monitor zones that are prone to geohazards
Up to 3.5 years of unattended operations, with up to 8 km communication range using LoRa networks

Model: LS-G6-TIL90-XE      LS-G6-TIL90-IE
Datasheet: https://info.worldsensing.com/Datasheet_Tilt90EDS_EN
Technical specifications

Category
Parameter
Specification / Details
General
Sensor Type
3-axis MEMS accelerometer


Range
±15°


Product Variants
LS-G6-TIL90-XE with external antenna LS-G6-TIL90-E with internal antenna


Power Source
2 × 3.6 V C-size replaceable batteries


Data Transmission
LoRa radio communications (ISM sub-GHz)


Operating Temperature
−40°C to +80°C


Weather Protection
IP68


System Configuration
Locally via Worldsensing App or remotely using CMT Edge on single-net deployments and CMT Cloud on multi-net deployments



Category
Parameter
Specification / Details
Normal State Operational Mode
Description
Continuous sampling at 4.9 Hz. Wireless communication to the gateway via LoRa network at a configurable reporting period ranging from 30 min to 24 h.


Accuracy (±4°)
±0.005°


Repeatability
<0.0005°


Offset Temperature Dependency
≤ 0.002°/°C
Threshold Breach
Description
When a reading in continuous sampling logs outside the threshold, an alert message is sent in real time. It also triggers an alert status that changes the data transmission according to the set reporting period for the alert status.


Communication Latency
2 s for 10 simultaneous alerts & 5 s for 25 simultaneous alerts


Repeatability (Continuous Sampling)
<0.0005°


Peak-to-Peak Noise
<0.0006°
Battery Life Estimations
Reporting Period
Lifespan


5 min
2.1 years


30 min
3.2 years


1 h
3.5 years


6 h
5.3 years



Laser Tiltmeter
The Worldsensing Laser Tiltmeter uses a laser to measure distance to reference points and a tiltmeter to detect vertical deviations in ground or structures.

3-in-1 laser distance meter, inclinometer and data logger designed to provide robust data when monitoring inclinations, movements and differential settlements of slopes or infrastructure
Field-proven, non-intrusive method for convergence monitoring with minimal interference to tunneling activities
Great communication ranges underground, with up to 10 km using repeaters
Compatible with Worldsensing’s single-net and multi-net configurations

Model: LS-G6-LAS-TIL90
Datasheet: https://info.worldsensing.com/Datasheet_LaserTilt90_EN
Technical specifications
Category
Parameter
Specification / Details
General
Sensor Type
2-in-1 Laser Distance Meter and 3-axis MEMS accelerometer


Power Source
2 × 3.6 V C-size replaceable batteries


Memory
100,000 readings including time, distance, and 3-axis tiltmeter measurements


Data Transmission
LoRa radio communication (ISM sub-GHz)


Operating Temperature
−20°C to +60°C


Weather Protection
IP68


System Configuration
Locally via Worldsensing App or remotely using CMT Edge on single-net deployments and CMT Cloud on multi-net deployments


Category
Parameter
Specification / Details
Laser Distance Meter
Sensor
Visible laser (class II) with 650 nm


Laser Power
0.75 to 0.95 mW


Resolution
0.1 mm


Repeatability (1σ)
0.15 mm


Accuracy
±1 mm at 10 m ±4 mm at 50 m ±8 mm at 150 m
Tiltmeter
Sensor
3-axis MEMS accelerometer


Range
±15°


Accuracy (±4°)
±0.005°


Repeatability
±0.0005°


Resolution
±0.0001°


Temperature Sensor Resolution
0.1°C
Battery Life Estimations
Reporting Period
20 m Distance / 65 m Distance


5 min
1.8 years / 6 months


1 h
10.3 years / 5.1 years


6 h
14.3 years / 9.2 years


Vibration Meter
The Vibration Meter is a wireless sensor that automates data collection for long term, continuous vibration monitoring. It features a tri-axial accelerometer and an exception-based, edge algorithm that allows the detection of threshold breaches for vibration-based events using LAW/PPV and frequency.

High precision 3-axis MEMS accelerometer. Up to 1000 Hz derived from a 4k Hz signal
Configurable operational modes to address different regulatory standards
Up to 1.5 years battery lifespan using a 30 min reporting period, considering a vibration scenario with relevant events triggering alert mode two or three times per week
Great communication ranges underground, with up to 10 km using repeaters
Compatible with Worldsensing’s single-net and multi-net configurations

Model: LSG7ACL-BILH-VIB
Datasheet: https://info.worldsensing.com/Datasheet_VibrationMeter_EN
Technical specifications


GNSS Meter
Worldsensing’s GNSS Meter is a wireless sensor that enables precise automated measurement of surface point movements. It features advanced multi-band Real-Time Kinematic (RTK) technology and innovative edge processing that delivers millimetric precision with great reliability.

Sub-centimeter level 3D positioning with RTK technology, delivering precision down to 2mm for 24h aggregated values.
Flexible configuration: operates seamlessly as both a base and rover.
Integrated tiltmeter and environmental sensors enhance data accuracy and reliability.
Long-lasting performance with up to 2.6 years of autonomy on an hourly reporting cycle.


Model: LSG7GNS-SXLH
Datasheet: https://info.worldsensing.com/Datasheet_GNSSMeter_EN
Technical specifications

Category
Parameter
Specification / Details
General
Sensor Type
GNSS


Secondary Sensor
Tiltmeter


Environmental Sensor
Integrated temperature and humidity sensor


Power Source
4 × 3.6 V D-size user-replaceable, high energy density batteries


Reporting Period
1 hour


Communication
LoRa radio (ISM sub-GHz)


GNSS Time Synchronization
±5 ns


Reporting Format
Position (WGS84) data for: • Last fix (real-time) • Last 6 h aggregated • Last 24 h aggregated


System Configuration
Device setup and configuration via Worldsensing App. Remote configuration using CMT Edge. Data can be exported to third-party software via MQTT, REST API, or FTP.





Category
Parameter
Specification / Details
GNSS Sensor
Correction Technology
Real Time Kinematic (RTK)


GNSS Channels
184


Constellations / GNSS Signals Received
• GPS: QZSS-L1CA, L2C • GLONASS: L1OF, L2OF • Galileo: E1B/C, E5b • BeiDou: B1I, B2I


GNSS Warmup Time
Selectable from: 10 s 20 s 30 s
Tiltmeter
Sensor Type
3-axis MEMS accelerometer


Range
±15°


Accuracy
±(0.0025° + 0.005% FS) ±(0.005° + 0.012% FS) ±(0.007° + 0.015% FS)


Offset Temperature Dependency
≤ 0.002°/°C
GNSS Precision (95th Percentile)
Distance Base to Rover
40 m (Horizontal / Vertical) 4,000 m (Horizontal / Vertical)


1 h Last Sample
9 mm / 20 mm (40 m) 21 mm / 27 mm (4,000 m)


6 h Aggregated
5 mm / 8 mm (40 m) 8 mm / 14 mm (4,000 m)


24 h Aggregated
2 mm / 3 mm (40 m) 4 mm / 7 mm (4,000 m)
Battery Life Estimations
Warmup Time
10 s / 20 s / 30 s


1 h Reporting Period
3.1 years / 2.9 years / 2.4 years


6 h Reporting Period
10.2 years / 9.9 years / 9.2 years


24 h Reporting Period
22 years / 21 years / 20 years


Core Communications
Leverage top-of-line communication coverage and work with minimum downtimes to deploy robust, secure and reliable communication networks for your monitoring projects

Key features
Choose your network and enable your communications with Worldsensing’s broadband and narrowband connectivity portfolio. Extend your narrowband networks using repeaters to gain extra coverage in low-visibility environments

Narrowband communications
Rely on powerful signal strength, excellent interference mitigation and enhanced radio performance for your monitoring systems. Use the 4G Rugged Gateway in combination with the different variants of Worldsensing Management Software to deploy private, locally managed, single-net deployments, or redundant, multi-network deployments managed in the cloud. Leverage the addition of the Edge Repeater to obtain additional radio coverage in underground or tunnel construction projects.

Narrowband gateways
Choose between Edge or Cloud according to your network configuration
4G Rugged Gateway

Narrowband repeaters
Extend your edge networks
K20 Edge Repeater

Broadband communications
Select Worldsensing’s broadband communications for high data-rate and high-power monitoring projects. Broadband communications are enabled by Worldsensing’s ThreadX3 Device, a fully autonomous sensor connectivity device with an integrated 4G/LTE cellular modem, wireless mesh networking, and an internal battery pack.

Broadband gateways
2-in-1 data logger and gateway for broadband communications
Thread

Narrowband Communications
Gateway: 4G Rugged Gateway
The 4G Rugged Gateway is an outdoor LoRa gateway featuring 4G and Ethernet backhaul connectivity. It serves as the core communication hub for Worldsensing edge devices, efficiently connecting a high volume of end devices and managing millions of bidirectional messages daily.

The 4G Rugged Gateway is a key component for Worldsensing’s narrowband networks
Provides connectivity in areas without internet coverage using LoRa/LoRaWAN radio communications
Supports private, single-network local deployments and redundant, multi-network cloud deployments with Worldsensing’s CMT software.
4G Rugged Gateway Cloud
Set up multi-gateway networks for data redundancy: if one gateway fails, data is routed through alternative gateways to CMT Cloud. Manage all networks, devices, and data from a single interface in CMT Cloud.
4G Rugged Gateway Edge
Operate your network, device and data locally via ethernet or 4G using the embedded CMT Edge. Compatible with the K20 Edge Repeater in the 863-874.4MHz (EMEA, India) and 915-928MHz (APAC, Latin America) bands for extended radio range.
4G Rugged Gateway Edge 915R
Operate your network, device and data locally via ethernet or 4G using the embedded CMT Edge. Compatible with the K20 Edge Repeater 915R for extended radio range in the 902-928MHz (North America) radio band.

Model: LS-M6-KIO-GW     LS-G6-KIO-GW      LS-G6-KIOGW915R
Datasheet: 
4G Rugged Gateway - Cloud
https://info.worldsensing.com/datasheet_4GGatewayCloud_EN?_gl=1*11d58oe*_gcl_au*NjgzMjAxOTU5LjE3NjEzMDU4MTU.

Edge Gateway Datasheet EN
https://info.worldsensing.com/datasheet_4GGatewayEdge_EN?_gl=1*337tu4*_gcl_au*NjgzMjAxOTU5LjE3NjEzMDU4MTU.

Edge Gateway 915R Datasheet EN
https://info.worldsensing.com/Datasheet_4GRuggedGatewayEdge915R_EN?_gl=1*337tu4*_gcl_au*NjgzMjAxOTU5LjE3NjEzMDU4MTU.
Edge Gateway Datasheet PT
https://info.worldsensing.com/4G-Rugged-Gateway-Edge-datasheet-PT?_gl=1*jn3usr*_gcl_au*NjgzMjAxOTU5LjE3NjEzMDU4MTU.

Technical specifications
Category
Specification / Details
Radio Communication Protocol
LoRa / LoRaWAN
Backhaul Connectivity
4G Worldwide module with 3G/2G fallback; Ethernet (RJ45)
Antenna
Integrated internal antennas: GPS, 4G, LoRa (peak gain = 2.6 dBi) Optional external antenna
Supported Unlicensed Bands
863–874.4 MHz (EMEA, India), 902–928 MHz (North America), 915–928 MHz (APAC, Latin America)
Rx Sensitivity
−141 dBm (SF12)
Weather Protection
IP68
Operating Temperature
−40°C to +60°C
Local Access
Via USB-C port


Category
Parameter
Specification / Details
Device Interfaces
Ethernet
Waterproof RJ45


Cellular
Waterproof Mini SIM card slot
Power Requirements
Power Options
PoE both mode A and mode B (802.3 af specifications) 5V through USB-C PoE injector for indoor use included in the kit


Mean Power Consumption
4.5 W

K20 Edge Repeater
The repeater retransmits data from its associated nodes to the main gateway. Data can travel along multiple repeaters in hops before arriving at the main gateway, thus gaining significant longer range.
The K20 Edge Repeater extends the network range of single-net deployments
Field-proven tree network technology which has been tested for both straight and curved tunnels in underground mines
Up to 10 km of radio coverage for underground monitoring systems
Compared to other network topologies, long-range LoRa Tree topology offers the longest radio range in underground environments

Product Variants
K20 Edge Repeater
K20 Edge Repeater 915R

Model: RPK20E
Datasheet: https://info.worldsensing.com/K20EdgeRepeater_Datasheet?_gl=1*1keb51l*_gcl_au*NjgzMjAxOTU5LjE3NjEzMDU4MTU.
Technical specifications

Category
Parameter
Specification / Details
Radio Communication Protocol


LoRa
Supported Unlicensed Bands


863–874.4 MHz (EMEA, India), 902–928 MHz (North America), 915–928 MHz (APAC, Latin America)
Antenna


Integrated internal antennas GPS, 4G, LoRa (peak gain = 2.6 dBi)
Maximum Distance Between Hops


150 m to 3 km / 0.1 mi to 1.83 mi
Maximum Number of Hops


8 hops
Sensitivity
Node to Repeater / Gateway
Down to −137 dBm (SF11)


Repeater to Repeater / Gateway
Down to −127 dBm (SF7)
Communications Performance
Message Rate (Default Network)
3.125 messages/min


Probability of Transmission Success (Default Network)
> 99.7% ± 3σ


Message Rate (High Demand Network)
8 messages/min


Probability of Transmission Success (High Demand Network)
> 98.75% ± 2.5σ
Device Capacity per Network
Reporting Period — 5 min
Default Network: 15 High Demand Network: 40


Reporting Period — 30 min
Default Network: 93 High Demand Network: 240


Reporting Period — 1 h
Default Network: 187 High Demand Network: 480
Power Options
Power Options
PoE both mode A and mode B (802.3af specifications); 5V through USB-C; PoE injector for indoor use included in the kit


Mean Power Consumption
4.5 W


Weather Protection
IP67


Operating Temperature
−40°C to +60°C


Broadband Communications
Thread
The Thread X3 is designed for customers needing broadband connectivity for high data-rate, high-power industrial projects. This autonomous device features an integrated 4G/LTE modem, wireless mesh networking, and a battery pack in a weather-resistant enclosure.

The Thread X3 is the key component for Worldsensing’s broadband networks
Provides robust connectivity to sensors that are data-intensive and power-demanding
Enables complex monitoring applications with simple configuration steps

Model: ThreadX3
Datasheet: https://info.worldsensing.com/Datasheet_ThreadX3_EN?_gl=1*147tzpe*_gcl_au*NjgzMjAxOTU5LjE3NjEzMDU4MTU.
Technical specifications

Category
Parameter
Specification / Details
Network Features
Cellular
Integrated SIM card. Globally compliant on 600+ cellular networks across 190 countries.


Ethernet
10/100 Ethernet interface with end-to-end encrypted communication secured by TLS 1.2.


Wireless Mesh
LPWA with compatible devices and smart sensors through MQTT-SN standard. Automatic network role detection (Gateway, Repeater, or Endpoint).



Category
Parameter
Specification / Details
Sensor I/O
Number of Channels
3 channels


Input Types
Channel 01: USB, RS232, RS485, 4–20 mA Channel 02: RS232, RS485, 4–20 mA Channel 03: RS232, RS485, 4–20 mA


Power
12 or 15 VDC Out, up to 20 W


Advanced Capabilities
Supports Multiplexer (MUX) with up to 128 sensors. Relay capabilities: each device port can output 12V that can be toggled on/off manually, via API integration, alert trigger, or recorded flow.
Power Requirements
Input Voltage
Nominal voltage 24 VDC, range 15–26 VDC


Mean Power Consumption
Up to 2500 mA RMS (Charge mode); 200 mA RMS (Standard mode); 20 mA RMS (Low power mode) @ 24 VDC


Direct Connect Solar Panel
Maximum Peak Power (Pmax): 160 W Maximum open circuit voltage (Voc): 22.9 V Optimum operating voltage (Vmp): 20.2 V Maximum operating current (Imp): 7.92 A


Battery
Internal 12.8 V 9.9 AH (126.72 Wh) LiFePO4



`
        }
      ]
    };

    if (needsWebAccess) {
      systemInstruction.parts[0].text += `\n\nYou have the ability to access and fetch content from websites. When a user asks for information that requires current data, external research, or information not in your training data, you can request web access by including "Can i Access Website:" followed by the URL in your response. The system will fetch the content and provide it to you for analysis. Use this capability when:
- Users ask for current news, updates, or recent developments
- Questions require data from external sources
- Information about competitors, industry trends, or market data
- Technical specifications or documentation from other websites
- Real-time information like weather, stock prices, or current events

Format: Can i Access Website: https://example.com/path`;
    }

    // Prepare the request body for Google API
    // Ensure we have at least the current user message in contents
    let contents = history || [];
    if (!contents.length || contents[contents.length - 1].role !== 'user') {
      const userParts = [{ text: message }];
      if (file && file.data && file.mimeType) {
        userParts.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.data
          }
        });
      }
      contents.push({
        role: 'user',
        parts: userParts
      });
    }

    const requestBody = {
      contents: contents,
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    // Make direct API call to Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google API error:', errorData);
      throw new Error(`Google API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error("Invalid API response structure.");
    }

    const apiResponseText = data.candidates[0].content.parts[0].text.trim();
    res.json({ response: apiResponseText });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate response' });
  }
});

// User profile endpoint
app.post('/api/user-profile', (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    // In a real app, save to database
    console.log('User profile saved:', { name, email });
    res.json({ success: true });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ error: 'Failed to save user profile' });
  }
});

// Serve static files
app.use(express.static('.'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});