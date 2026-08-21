  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?php echo htmlspecialchars($pageTitle ?? 'AI Fit Map'); ?></title>
  <meta name="description" content="<?php echo htmlspecialchars($metaDescription ?? ''); ?>" />
<?php if (!empty($canonical)): ?>
  <link rel="canonical" href="<?php echo htmlspecialchars($canonical); ?>" />
<?php endif; ?>
<?php if (!empty($robots)): ?>
  <meta name="robots" content="<?php echo htmlspecialchars($robots); ?>" />
<?php endif; ?>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/style.css" />
<?php if (!empty($extraCss)): ?>
<?php foreach ($extraCss as $css): ?>
  <link rel="stylesheet" href="<?php echo htmlspecialchars($css); ?>" />
<?php endforeach; ?>
<?php endif; ?>
