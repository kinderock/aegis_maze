var gulp = require('gulp'),
		browserSync = require('browser-sync'),
		stylus = require('gulp-stylus'),
		autoprefixer = require('gulp-autoprefixer'),
		uglify = require('gulp-uglify'),
		babel = require('gulp-babel'),
		concat = require('gulp-concat'),
		reload = browserSync.reload;

var path ={
	css: './css/',
	css_src: './css/src/',
	js: './js/',
	js_src: './js/src/',
	js_libs: './js/libs/',
};


gulp.task('styles', () => {
	gulp.src(path.css_src+'game.styl')
		.pipe(stylus({
			compress: true
		}))
		.pipe(gulp.dest(path.css))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(reload({stream:true}));
});


gulp.task('libs', () => {
	gulp.src([path.js_libs+'/src/mazeGenerator.js', path.js_libs+'/src/box2d-plugin-full.js'])
	.pipe(babel({
		presets: ['es2015']
	}))
	.pipe(uglify())
	.pipe(gulp.dest(path.js_libs))
});


gulp.task('scripts', () => {
	gulp.src([path.js_src+'vars.js', path.js_src+'*.js'])
	.pipe(concat('game.js'))
	.pipe(babel({
		presets: ['es2015']
	}))
	// .pipe(uglify())
	.pipe(gulp.dest(path.js))
});


gulp.task('serve', ['styles'], function() {
	browserSync.init({
		server: {
			baseDir: "./"
		},
	});

	gulp.watch(path.css+'**/*', ['styles']).on('change', browserSync.reload);
	gulp.watch(path.js+'**/*', ['scripts']).on('change', browserSync.reload);
	// gulp.watch("app/*.html").on('change', browserSync.reload);
});


gulp.task('default', ['serve']);
gulp.task('styl', ['styles']);
gulp.task('js', ['scripts', 'libs']);
