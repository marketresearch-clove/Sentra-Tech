const chatBody = document.querySelector("#chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

// User info form elements
const userInfoForm = document.querySelector("#user-info-form");
const infoForm = document.querySelector("#info-form");
const userNameInput = document.querySelector("#user-name");
const userEmailInput = document.querySelector("#user-email");
const submitInfoBtn = document.querySelector("#submit-info");
const nameError = document.querySelector("#name-error");
const emailError = document.querySelector("#email-error");
const chatFooter = document.querySelector("#chat-footer");
const welcomeMessage = document.querySelector("#welcome-message");

// -----------------------------------------------------------------
// 🚨 CRITICAL SECURITY WARNING
// -----------------------------------------------------------------
// DO NOT put your API key in client-side JavaScript.
// Anyone visiting your site can steal it and use your quota.
// This key should be in a backend server.
//
// For testing, you can use it here, but replace it before deploying.
// -----------------------------------------------------------------
const API_KEY = "AIzaSyBRDrLF5BZuAOazd5vhZnYtEDAGTlDMlB0"; // ⚠️ Replace this

// API setup - Changed to v1beta, which works with gemini-1.5-flash-latest
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

// Initialize user message and file data
const userData = {
  message: null,
  file: {
    data: null,
    mimeType: null, // <-- FIX: Changed from mime_type
  },
};

// User profile data
let userProfile = {
  name: null,
  email: null,
  isFormSubmitted: false
};

// Store chat history - Now starts empty.
const chatHistory = [];

// System instruction with company context
const systemInstruction = {
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
Sentra operates under Clove Technologies’ Smart Infrastructure division, focusing on intelligent monitoring systems, IoT-based sensing, and digital twin integration for infrastructure lifecycle management.

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


You have the ability to access and fetch content from websites. When a user asks for information that requires current data, external research, or information not in your training data, you can request web access by including "Can i Access Website:" followed by the URL in your response. The system will fetch the content and provide it to you for analysis. Use this capability when:
- Users ask for current news, updates, or recent developments
- Questions require data from external sources
- Information about competitors, industry trends, or market data
- Technical specifications or documentation from other websites
- Real-time information like weather, stock prices, or current events

Format: Can i Access Website:: https://example.com/path

`,


    },
  ],
};

const initialInputHeight = messageInput.scrollHeight;

// Simple markdown parser for basic formatting
const parseMarkdown = (text) => {
  let parsed = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
    .replace(/^### (.*$)/gim, '<h3>$1</h3>') // H3
    .replace(/^## (.*$)/gim, '<h2>$1</h2>') // H2
    .replace(/^# (.*$)/gim, '<h1>$1</h1>') // H1
    .replace(/^- (.*$)/gim, '• $1') // Bullet points with -
    .replace(/^\* (.*$)/gim, '• $1') // Bullet points with *
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic (after bullets)
    .replace(/^---$/gm, '<hr>'); // Horizontal rules

  // Basic table parsing
  const lines = parsed.split('\n');
  let inTable = false;
  let tableRows = [];
  let newLines = [];

  for (let line of lines) {
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      tableRows.push(cells);
    } else {
      if (inTable) {
        // End table
        let tableHtml = '<div style="overflow-x: auto;"><table border="1" style="border-collapse: collapse; width: 100%; min-width: 600px;">';
        tableRows.forEach((row, index) => {
          // Skip separator rows (rows with only dashes, colons, or empty/whitespace cells)
          if (row.every(cell => /^[-:\s]*$/.test(cell.trim()))) return;

          const tag = index === 0 ? 'th' : 'td';
          const style = tag === 'th' ? 'padding: 8px; text-align: left; background-color: #000; color: #fff; font-weight: bold;' : 'padding: 8px; text-align: left;';
          tableHtml += '<tr>';
          row.forEach(cell => {
            tableHtml += `<${tag} style="${style}">${cell}</${tag}>`;
          });
          tableHtml += '</tr>';
        });
        tableHtml += '</table></div>';
        newLines.push(tableHtml);
        inTable = false;
      }
      newLines.push(line);
    }
  }
  if (inTable) {
    let tableHtml = '<div style="overflow-x: auto;"><table border="1" style="border-collapse: collapse; width: 100%; min-width: 600px;">';
    tableRows.forEach((row, index) => {
      // Skip separator rows (rows with only dashes, colons, or empty/whitespace cells)
      if (row.every(cell => /^[-:\s]*$/.test(cell.trim()))) return;

      const tag = index === 0 ? 'th' : 'td';
      const style = tag === 'th' ? 'padding: 8px; text-align: left; background-color: #000; color: #fff; font-weight: bold;' : 'padding: 8px; text-align: left;';
      tableHtml += '<tr>';
      row.forEach(cell => {
        tableHtml += `<${tag} style="${style}">${cell}</${tag}>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</table></div>';
    newLines.push(tableHtml);
  }

  return newLines.join('<br>');
};

// Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Generate bot response using Gemini API directly
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  // Add user message to chat history
  chatHistory.push({
    role: "user",
    parts: [{ text: userData.message }],
  });

  try {
    // Send message to Gemini API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: chatHistory,
        systemInstruction: systemInstruction,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let apiResponseText = data.candidates[0].content.parts[0].text;

    // Display the final response
    messageElement.innerHTML = parseMarkdown(apiResponseText);

    // Add bot response to chat history
    chatHistory.push({
      role: "model",
      parts: [{ text: apiResponseText }],
    });
  } catch (error) {
    // Handle error in API response
    console.error(error);
    messageElement.innerText = `Error: ${error.message}`;
    messageElement.style.color = "#ff0000";
  } finally {
    // Reset user's file data, removing thinking indicator and scroll chat to bottom
    userData.file = { data: null, mimeType: null };
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

// Handle outgoing user messages
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();

  // Do nothing if message and file are empty
  if (!userData.message && !userData.file.data) {
    messageInput.value = "";
    return;
  }

  messageInput.value = "";
  messageInput.dispatchEvent(new Event("input"));
  fileUploadWrapper.classList.remove("file-uploaded");

  // Create and display user message
  const messageContent = `<div class="message-text"></div>
                          ${userData.file.data
      ? `<img src="data:${userData.file.mimeType};base64,${userData.file.data}" class="attachment" />`
      : ""
    }`;
  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  outgoingMessageDiv.querySelector(".message-text").innerText = userData.message;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  // Simulate bot response with thinking indicator after a delay
  setTimeout(() => {
    const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
            <path
              d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"
            />
          </svg>
          <div class="message-text">
            <div class="thinking-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>`;
    const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    generateBotResponse(incomingMessageDiv);
  }, 600);
};

// Adjust input field height dynamically
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius =
    messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

// Handle Enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  const fileUploaded = userData.file.data;

  if (e.key === "Enter" && !e.shiftKey && (userMessage || fileUploaded) && window.innerWidth > 768) {
    handleOutgoingMessage(e);
  }
});

// Handle file input change and preview the selected file
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  // Simple validation for image types (optional but recommended)
  if (!file.type.startsWith("image/")) {
    alert("Please select an image file (e.g., JPEG, PNG, WEBP).");
    fileInput.value = ""; // Clear the input
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];

    // Store file data in userData
    userData.file = {
      data: base64String,
      mimeType: file.type, // <-- FIX: Use mimeType
    };
  };
  reader.readAsDataURL(file);
});

// Cancel file upload
fileCancelButton.addEventListener("click", () => {
  userData.file = { data: null, mimeType: null };
  fileUploadWrapper.classList.remove("file-uploaded");
});

// Assume EmojiMart is loaded correctly in your HTML
// Initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
    const { selectionStart: start, selectionEnd: end } = messageInput;
    messageInput.setRangeText(emoji.native, start, end, "end");
    messageInput.focus();
  },
  onClickOutside: (e) => {
    if (e.target.id === "emoji-picker") {
      document.body.classList.toggle("show-emoji-picker");
    } else {
      document.body.classList.remove("show-emoji-picker");
    }
  },
});
document.querySelector(".chat-form").appendChild(picker);

// Function to get time-based greeting
function getTimeBasedGreeting() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "Good evening";
  } else {
    return "Hello";
  }
}

// Function to validate business email
function isBusinessEmail(email) {
  const publicDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'live.com', 'msn.com', 'yahoo.co.uk', 'googlemail.com',
    'me.com', 'mac.com', 'comcast.net', 'verizon.net', 'att.net',
    'sbcglobal.net', 'bellsouth.net', 'cox.net', 'earthlink.net',
    'protonmail.com', 'mail.com', 'yandex.com', 'zoho.com', 'gmx.com'
  ];

  const domain = email.split('@')[1].toLowerCase();
  return !publicDomains.includes(domain);
}

// Function to handle user info form submission
function handleInfoFormSubmission(e) {
  e.preventDefault();

  const name = userNameInput.value.trim();
  const email = userEmailInput.value.trim();

  let isValid = true;

  // Clear previous errors
  nameError.textContent = '';
  emailError.textContent = '';

  // Validate name
  if (!name) {
    nameError.textContent = 'Please enter your name';
    isValid = false;
  }

  // Validate email
  if (!email) {
    emailError.textContent = 'Please enter your email';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError.textContent = 'Please enter a valid email address';
    isValid = false;
  } else if (!isBusinessEmail(email)) {
    emailError.textContent = 'Please use a business email address';
    isValid = false;
  }

  if (isValid) {
    // Store user profile
    userProfile.name = name;
    userProfile.email = email;
    userProfile.isFormSubmitted = true;

    // Hide form and show chat interface
    userInfoForm.style.display = 'none';
    chatBody.style.display = 'block';
    chatFooter.style.display = 'block';

    // Update welcome message with personalized greeting
    const greeting = getTimeBasedGreeting();
    welcomeMessage.textContent = `${greeting}, ${name}! How can I help you today?`;
  }
}

// --- Event Listeners ---
infoForm.addEventListener("submit", handleInfoFormSubmission);

sendMessage.addEventListener("click", (e) => {
  if (!userProfile.isFormSubmitted) return;

  const userMessage = messageInput.value.trim();
  const fileUploaded = userData.file.data;
  if (userMessage || fileUploaded) {
    handleOutgoingMessage(e);
  }
});
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));