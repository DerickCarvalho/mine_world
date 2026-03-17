<?php
$allowedPages = [
    'menu',
    'mundos',
    'opcoes',
    'jogo',
];

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_SPECIAL_CHARS) ?: 'menu';
$page = preg_replace('/[^a-z0-9_-]/i', '', $page);

if (!in_array($page, $allowedPages, true)) {
    $page = 'menu';
}

$pageTitles = [
    'menu' => 'MineWorld - Menu',
    'mundos' => 'MineWorld - Mundos',
    'opcoes' => 'MineWorld - Opcoes',
    'jogo' => 'MineWorld - Jogo',
];

$pageTitle = $pageTitles[$page] ?? 'MineWorld';
$pageCssPath = __DIR__ . '/assets/css/custom/pages/' . $page . '.css';
$pageCssHref = 'assets/css/custom/pages/' . $page . '.css';
$pageJsPath = __DIR__ . '/assets/js/paginas/' . $page . '.js';
$pageJsHref = 'assets/js/paginas/' . $page . '.js';
$pageJsType = $page === 'jogo' ? 'module' : 'text/javascript';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8'); ?></title>
    <link rel="stylesheet" href="assets/css/custom/global.css">
    <?php if (is_file($pageCssPath)) : ?>
        <link rel="stylesheet" href="<?php echo htmlspecialchars($pageCssHref, ENT_QUOTES, 'UTF-8'); ?>">
    <?php endif; ?>
</head>
<body class="page-shell" data-page="<?php echo htmlspecialchars($page, ENT_QUOTES, 'UTF-8'); ?>">
<?php include __DIR__ . '/partials/loading-ui.php'; ?>
<?php include __DIR__ . '/layout.php'; ?>

<script src="env.default.js"></script>
<script src="assets/js/Loading.js"></script>
<script src="assets/js/alert.js"></script>
<script src="assets/js/ApiRequest.js"></script>
<script src="assets/js/auth.js"></script>
<?php if (is_file($pageJsPath)) : ?>
<script type="<?php echo htmlspecialchars($pageJsType, ENT_QUOTES, 'UTF-8'); ?>" src="<?php echo htmlspecialchars($pageJsHref, ENT_QUOTES, 'UTF-8'); ?>"></script>
<?php endif; ?>
<script>
window.addEventListener('DOMContentLoaded', function () {
    if (window.auth) {
        window.auth.initProtectedShell({
            page: <?php echo json_encode($page, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>
        });
    }
});
</script>
</body>
</html>
