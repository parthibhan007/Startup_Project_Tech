/* ========== Get Testimonials =========== */
const getTestimonials = async () => {
  try {
    const results = await fetch("D:\Parthibhan\Anish\data\testimonials.json"); // Fetch from the correct path
    const data = await results.json();
    return data.testimonials;
  } catch (err) {
    console.error('Error fetching testimonials:', err);
  }
};

const testimonialsWrapper = document.querySelector('.test-wrapper');
const cards = [...document.querySelectorAll('.card')];

/* ========== Display Testimonials =========== */
const displayTestimonials = (items) => {
  const testimonialsHTML = items.map(
    (item) => ` 
      <div class="testimonial" data-id="${item.name}">
        <div class="d-flex">
          <div>
            <h4>${item.name}</h4>
            <span>${item.position}</span>
          </div>
          <div class="rating">
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class='bx bxs-star-half'></i></span>
            <span><i class='bx bxs-star-half'></i></span>
          </div>
        </div>
        <p>${item.info}</p>
      </div>
    `
  ).join('');

  testimonialsWrapper.innerHTML = testimonialsHTML;
};

/* ========== Filter Testimonials =========== */
const filter = () => {
  const testimonials = [...document.querySelectorAll('.testimonial')];
  if (testimonials.length === 0) return;

  cards[0].classList.add('active');
  testimonials[0].classList.add('active');

  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      cards.forEach((c) => c.classList.remove('active'));
      testimonials.forEach((t) => {
        t.classList.remove('active');
        t.style.opacity = 0;
      });

      card.classList.add('active');
      const filterValue = card.getAttribute('data-filter');

      testimonials.forEach((testimonial) => {
        if (testimonial.getAttribute('data-id') === filterValue) {
          testimonial.classList.add('active');
          testimonial.style.opacity = 1;
        }
      });
    });
  });
};

/* ========== Initialize =========== */
window.addEventListener('DOMContentLoaded', async () => {
  const testimonials = await getTestimonials();
  if (testimonials) {
    displayTestimonials(testimonials);
    filter();
  }
});
