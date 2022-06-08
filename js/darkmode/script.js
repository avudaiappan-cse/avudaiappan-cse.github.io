const toggleSwitch = document.querySelector("input[type='checkbox']");

// switch Theme Dynamically
function switchTheme(event) {
  console.log(event.target.checked);
  if (event.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

//Add Event Listener
toggleSwitch.addEventListener("change", switchTheme);
