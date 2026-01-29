# TennisMP 🎾

> Just Do Tennis - Nike Employee Tennis Club Mini Program

A WeChat Mini Program for organizing and managing tennis activities for Nike employees.

## Features

- 📋 **Activity List** - Browse upcoming tennis events
- 📝 **Event Registration** - Sign up for activities online
- 💰 **Online Payment** - Pay activity fees via WeChat Pay
- 👤 **Profile Center** - View my activity history

## Tech Stack

- WeChat Mini Program (Native)
- WeChat CloudBase
- WeChat Pay

## Project Structure

```
TennisMP/
├── miniprogram/              # Mini Program Frontend
│   ├── pages/                # Pages
│   │   ├── index/            # Home (Activity List)
│   │   ├── activity-detail/  # Activity Detail
│   │   ├── booking/          # Registration & Payment
│   │   ├── profile/          # Profile Center
│   │   └── my-activities/    # My Activities
│   ├── images/               # Image Assets
│   ├── app.js                # App Entry
│   ├── app.json              # App Configuration
│   └── app.wxss              # Global Styles
├── cloudfunctions/           # Cloud Functions
│   ├── user/                 # User Related
│   ├── activity/             # Activity Related
│   └── pay/                  # Payment Related
└── project.config.json       # Project Configuration
```

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/bingnuoyuan/TennisMP.git
cd TennisMP
```

### 2. Enable Cloud Development
1. Open WeChat DevTools
2. Import the project
3. Click "Cloud Development" button
4. Create a cloud environment

### 3. Create Database Collections
Create the following collections in Cloud Console:
- `users` - User information
- `activities` - Activity information
- `registrations` - Registration records

### 4. Deploy Cloud Functions
Right-click on each cloud function folder → Upload and Deploy: Install Dependencies on Cloud

### 5. Configure Payment (Optional)
Configure your merchant ID in `cloudfunctions/pay/index.js`

## Database Schema

### users
| Field | Type | Description |
|-------|------|-------------|
| _id | string | OpenID |
| nickName | string | Nickname |
| avatarUrl | string | Avatar URL |
| isAdmin | boolean | Admin flag |
| createTime | date | Created at |

### activities
| Field | Type | Description |
|-------|------|-------------|
| _id | string | Activity ID |
| title | string | Activity title |
| date | string | Activity date |
| time | string | Activity time |
| location | string | Location |
| price | number | Price per person |
| maxPeople | number | Maximum participants |
| currentPeople | number | Current registrations |
| status | string | Status: open/closed |

### registrations
| Field | Type | Description |
|-------|------|-------------|
| _id | string | Registration ID |
| orderId | string | Order number |
| activityId | string | Activity ID |
| userId | string | User OpenID |
| userName | string | User name |
| phone | string | Phone number |
| amount | number | Amount paid |
| paymentStatus | string | Payment status |
| createTime | date | Created at |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

---

**Just Do Tennis! 🎾**
