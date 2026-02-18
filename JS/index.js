// Show panel

const unitsBtn = document.querySelector('.nav-link');
const panel = document.querySelector('.panel');

unitsBtn.addEventListener('click', (e) =>{
    e.preventDefault();
    panel.classList.toggle('open');
});

const daysBtn = document.querySelector('.days-toggler');
const daysPanel = document.querySelector('.days-panel');

daysBtn.addEventListener('click', (e) =>{
    e.preventDefault();
    daysPanel.classList.toggle('open');
});

const actOptn = document.querySelectorAll('.option');

actOptn.forEach(option => {
    option.addEventListener('click', (e) => {
        e.currentTarget.classList.toggle('active');
    });
});
