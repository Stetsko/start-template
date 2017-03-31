var	gulp							=	require('gulp'),
		browserSync				=	require('browser-sync'),
		sass							= require('gulp-sass'),
		rename						=	require('gulp-rename'),
		autoprefixer			=	require('gulp-autoprefixer'),
		cleanCSS					=	require('gulp-clean-css'),
		concat						=	require('gulp-concat'),
		uglify						=	require('gulp-uglify'),
		del								=	require('del'),
		cache							=	require('gulp-cache'),
		fileinclude				=	require('gulp-file-include'),
		gulpRemoveHtml		=	require('gulp-remove-html'),
		imagemin					=	require('gulp-imagemin'),
		pngquant					=	require('imagemin-pngquant'),
		gcmq							=	require('gulp-group-css-media-queries'),
		smartgrid					=	require('smart-grid');


/* It's principal settings in smart grid project */
var settings = {
    outputStyle: 'scss', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: "30px", /* gutter width px || % */
    container: {
        maxWidth: '1200px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        lg: {
            'width': '1100px', /* -> @media (max-width: 1100px) */
            'fields': '30px' /* side fields */
        },
        md: {
            'width': '960px',
            'fields': '15px'
        },
        sm: {
            'width': '780px',
            'fields': '15px'
        },
        xs: {
            'width': '560px',
            'fields': '15px'
        }
        /* 
        We can create any quantity of break points.

        some_name: {
            some_width: 'Npx',
            some_offset: 'N(px|%)'
        }
        */
    }
};

smartgrid('./app/sass', settings);


gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
});

gulp.task('scss',['headerscss'], function() {
	return gulp.src('app/sass/**/*.scss')
		.pipe(sass())
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('headerscss', function() {
	return gulp.src('app/sass/header.scss')
		.pipe(sass())
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest('app/'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('libs', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js'
		])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'));
});

gulp.task('watch', ['scss', 'libs', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.scss', ['scss']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});


gulp.task('buildhtml', function() {
  gulp.src(['app/*.html'])
    .pipe(fileinclude({
      prefix: '@@'
    }))
    .pipe(gulpRemoveHtml())
    .pipe(gulp.dest('dist/'));
});

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img')); 
});

gulp.task('grup', function () {
    gulp.src('css/main.min.css')
        .pipe(gcmq())
        .pipe(gulp.dest('dist/css'));
});


gulp.task('removedist', function() { return del.sync('dist'); });

gulp.task('build', ['removedist', 'buildhtml', 'imagemin', 'scss', 'grup' , 'libs'], function() {

	var buildCss = gulp.src([
		'app/css/fonts.min.css',
		'app/css/main.min.css'
		]).pipe(gulp.dest('dist/css'));

	var buildFiles = gulp.src([
		'app/.htaccess'
	]).pipe(gulp.dest('dist'));

	var buildFonts = gulp.src('app/fonts/**/*').pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('app/js/**/*').pipe(gulp.dest('dist/js'));

});

gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default',['watch']);