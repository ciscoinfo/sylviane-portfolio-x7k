// Prépare les photos du site depuis /photos : recadrage, agrandissement net, léger contraste.
import sharp from 'sharp';

const enhance = (img) =>
  img
    .modulate({ brightness: 1.03, saturation: 1.06 })
    .linear(1.05, -4)
    .sharpen({ sigma: 1.1, m1: 0.8, m2: 1.5 })
    .jpeg({ quality: 88, mozjpeg: true });

// Portrait principal (arche du hero) : buste, mains ouvertes, recadrage 4:5
await enhance(
  sharp('local_dev/photos/20260925_154618_c.jpg')
    .extract({ left: 60, top: 0, width: 905, height: 1132 })
    .resize({ width: 960, kernel: 'lanczos3' })
).toFile('public/photo-sylviane.jpg');

// Photo avec la main levée (section Profil)
await enhance(
  sharp('local_dev/photos/20260925_153800_b.jpg').resize({ width: 960, kernel: 'lanczos3' })
).toFile('public/photo-sylviane-main.jpg');

console.log('ok');

// Visage pour les jeux : recadrage carré net, prêt à être réduit sans artefacts (affiché à 46-120 px, donc 192 px suffit en x2)
await sharp('local_dev/photos/20260925_154618_c.jpg')
  .extract({ left: 345, top: 140, width: 300, height: 300 })
  .resize({ width: 192, height: 192, kernel: 'lanczos3' })
  .sharpen({ sigma: 0.8 })
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile('public/face.jpg');
console.log('visage ok');
