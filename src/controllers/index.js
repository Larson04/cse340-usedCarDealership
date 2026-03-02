// Route handlers for static pages
export const homePage = (req, res) => {
    res.render('home', { title: 'Home' });
};
