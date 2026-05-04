# 👓 OpticView

**OpticView** is a frontend application built with **React**, **Bootstrap 4**, **SCSS**, and **Material UI**. It provides a modern, responsive interface for creating, editing, and managing design templates — ideal for form fields, question sets, and layout-driven data structures.

---

## 🚀 Features

- 📐 **Template Builder**: Create and manage custom templates with structured input fields.
- 🎨 **Responsive UI**: Built with Material UI components and Bootstrap 4 layout utilities.
- 💡 **Dynamic Field Handling**: Supports form fields, question fields, and advanced coordinate-based layouts.
- 💾 **Local Storage / IndexedDB**: Store large JSON data structures safely.
- 🔔 **Toast Notifications**: Feedback system using `react-toastify`.

---

## 🛠️ Tech Stack

| Tool | Usage |
|------|-------|
| [React](https://reactjs.org/) | Frontend library for building UI |
| [Bootstrap 4](https://getbootstrap.com/docs/4.0/getting-started/introduction/) | Responsive grid & utility classes |
| [SCSS](https://sass-lang.com/) | Custom styling and theme support |
| [Material UI](https://mui.com/) | UI components and theming |
| [React Toastify](https://fkhadra.github.io/react-toastify/introduction) | Toast notifications |
| [IndexedDB (via idb)](https://www.npmjs.com/package/idb) | Local data persistence |

---

## 📁 Folder Structure (Simplified)

opticview/
├── public/
├── src/
│ ├── components/
│ ├── contexts/
│ ├── styles/
│ ├── utils/
│ ├── App.js
│ ├── index.js
│ └── ...
├── package.json
└── README.md


## 🧑‍💻 Getting Started

### Prerequisites

- Node.js v14+
- npm or yarn

### Installation

```bash
git clone https://github.com/your-username/opticview.git
cd opticview
npm install


 Usage Notes
Templates can include both form fields and question fields.

Coordinates (Start Row, Start Col, etc.) are used to map logical structure.

IndexedDB is used to store large template JSON files exceeding localStorage limits.

You can switch between front and back layouts using the interface.
