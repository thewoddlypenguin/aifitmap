<?php
$pageTitle       = 'AI Tools by Category – AI Fit Map';
$metaDescription = 'Browse AI tools by category and find the right fit for you.';
$canonical       = 'https://aifitmap.com/tools/';
$pageType        = 'app';
$extraCss        = ['/css/category.css'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/head.php'; ?>
</head>
<body>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php'; ?>

  <main class="main-content">
    <!-- Category index rendered by CategoryPage.initIndex() -->
  </main>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>
<?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/scripts-app.php'; ?>

</body>
</html>
