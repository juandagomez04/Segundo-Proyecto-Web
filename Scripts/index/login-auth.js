// login event - index.html
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  form.addEventListener('submit', iniciarSesion);
});

// register users event - register.html
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form');
  form.addEventListener('submit', registrarUsuario);
});

// register drivers event - register-driver.html
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form');
  form.addEventListener('submit', registrarConductor);
});

// Functions for login and registration
function iniciarSesion(event) {
  event.preventDefault();

  const email = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const drivers = JSON.parse(localStorage.getItem('drivers')) || [];

  const user = users.find(u => u.email === email && u.password === password);
  const driver = drivers.find(d => d.email === email && d.password === password);

  if (user) {
    // Guardamos el usuario actual en sessionStorage
    sessionStorage.setItem("currentUser", JSON.stringify({
      type: "user",
      data: user
    }));

    window.location.href = 'home_searchrides.html';
  } else if (driver) {
    // Guardamos el conductor actual en sessionStorage
    sessionStorage.setItem("currentUser", JSON.stringify({
      type: "driver",
      data: driver
    }));

    window.location.href = 'myrides.html';
  } else {
    alert('Correo o contraseña incorrecta');
  }
}


function registrarUsuario(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const repeat = document.getElementById('repeat').value;

  if (password !== repeat) {
    alert('Las contraseñas no coinciden.');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.some(user => user.email === email)) {
    alert('Este correo ya está registrado. Usa otro o inicia sesión.');
    return;
  }

  const user = {
    fname: document.getElementById('fname').value,
    lname: document.getElementById('lname').value,
    email,
    password,
    address: document.getElementById('address').value,
    country: document.getElementById('country').value,
    state: document.getElementById('state').value,
    city: document.getElementById('city').value,
    phone: document.getElementById('phone').value
  };

  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));

  alert('Registro exitoso');
  window.location.href = 'index.html';
}

function registrarConductor(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const repeat = document.getElementById('repeat').value;

  if (password !== repeat) {
    alert('Las contraseñas no coinciden.');
    return;
  }

  const drivers = JSON.parse(localStorage.getItem('drivers')) || [];

  if (drivers.some(driver => driver.email === email)) {
    alert('Este correo ya está registrado como conductor.');
    return;
  }

  const driver = {
    fname: document.getElementById('fname').value,
    lname: document.getElementById('lname').value,
    cedula: document.getElementById('cedula').value,
    dob: document.getElementById('dob').value,
    email,
    password,
    phone: document.getElementById('phone').value,
    brand: document.getElementById('brand').value,
    model: document.getElementById('model').value,
    year: document.getElementById('year').value,
    plate: document.getElementById('plate').value
  };

  drivers.push(driver);
  localStorage.setItem('drivers', JSON.stringify(drivers));

  alert('Registro de conductor exitoso');
  window.location.href = 'index.html';
}




