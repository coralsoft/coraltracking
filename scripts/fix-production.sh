#!/bin/bash
# Script para solucionar errores en producción - Coral Tracking
# Ejecutar desde la raíz del proyecto: bash scripts/fix-production.sh

set -e

echo "🔧 Instalando dependencias de Composer..."
composer install --optimize-autoloader --no-dev

echo "🧹 Limpiando cachés..."
php artisan optimize:clear

echo "📦 Regenerando autoload..."
composer dump-autoload

echo "🗄️  Ejecutando migraciones..."
php artisan migrate --force

# Opcional: descomenta si tienes un seeder de producción
# echo "🌱 Ejecutando seeder de producción..."
# php artisan db:seed --class=ProductionSeeder --force

echo "🔗 Creando enlace simbólico de storage..."
php artisan storage:link 2>/dev/null || true

echo "📦 Instalando dependencias de NPM..."
npm ci

echo "🏗️  Construyendo assets para producción..."
npm run build

echo "⚡ Cacheando configuraciones..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ ¡Listo! Los errores deberían estar resueltos."
