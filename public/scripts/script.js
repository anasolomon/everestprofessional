document.addEventListener("DOMContentLoaded", () => {
const yearSpan = document.getElementById("current-year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
});
  
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  const logoText = document.querySelector('.logo-text');
  
  const hideAfter = 1;   // navbar disappears after 50px scroll
  const scrolledAfter = 1; // when background turns white, logo-text hides

  if (window.scrollY > hideAfter) {
    navbar.classList.add('hidden');  // hide navbar early
  } else {
    navbar.classList.remove('hidden');
  }

  if (window.scrollY > scrolledAfter) {
    navbar.classList.add('scrolled');
    if (logoText) logoText.style.display = 'none';
  } else {
    navbar.classList.remove('scrolled');
    if (logoText) logoText.style.display = 'block';
  }
});
  
burger.addEventListener('click', () => {
  mobileMenu.style.display = 'flex';
  burger.classList.add('hidden');
  document.body.classList.add('menu-open'); // LOCK scroll
});

closeMenu.addEventListener('click', () => {
  mobileMenu.style.display = 'none';
  burger.classList.remove('hidden');
  document.body.classList.remove('menu-open'); // UNLOCK scroll
});

// Also unlock scrolling when link clicked
document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.style.display = 'none';
    burger.classList.remove('hidden');
    document.body.classList.remove('menu-open');
  });
});



const counters = document.querySelectorAll('.counter');

const animateCounter = (counter) => {
  const target = +counter.getAttribute('data-target');
  const duration = 2000;
  let start = 0;
  const startTime = performance.now();

  const updateCounter = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    counter.innerText = Math.floor(progress * target);
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      counter.innerText = target;
    }
  };

  requestAnimationFrame(updateCounter);
};

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      obs.unobserve(entry.target); // Run only once
    }
  });
}, {
  threshold: 0.5
});

counters.forEach(counter => observer.observe(counter));

let index = 0;

function move(step) {
  index = (index + step + total) % total;
  track.style.transform = `translateX(-${index * 1583}px)`;
}

const paeseSelect = document.getElementById('paese');
const regioneSelect = document.getElementById('regione');
const regioneLabel = document.getElementById('label-regione');

if (paeseSelect && regioneSelect && regioneLabel) {
  function toggleRegione() {
      if (paeseSelect.value === 'Italia') {
          regioneLabel.style.display = 'block';
          regioneSelect.style.display = 'inline';
      } else {
          regioneLabel.style.display = 'none';
          regioneSelect.style.display = 'none';
      }
  }

  paeseSelect.addEventListener('change', toggleRegione);
  toggleRegione(); // stato iniziale
}

// Disable right-click
// document.addEventListener('contextmenu', function (e) {
//   e.preventDefault();
// });

// // Disable certain key combinations
// document.addEventListener('keydown', function (e) {
//   // Disable Ctrl+U (View Source)
//   if (e.ctrlKey && e.key.toLowerCase() === 'u') {
//     e.preventDefault();
//   }

//   // Disable Ctrl+Shift+I (DevTools)
//   if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
//     e.preventDefault();
//   }

//   // Disable F12 (DevTools)
//   if (e.key === 'F12') {
//     e.preventDefault();
//   }
  
//   // Disable Ctrl+Shift+C (Inspect Element)
//   if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
//     e.preventDefault();
//   }
// });