const envVars = {};

try{

	require('fs').readFileSync('.env', 'utf8').split('\n').forEach(KV => {

		const key = KV.split('=')[0];
		const value = KV.split('=')[1];

		envVars[key] = value;

	});

} catch(err){
	console.log(err);
}

const gulp = require('gulp');
const babel = require('gulp-babel');
const process = require('gulp-preprocess');

console.log(envVars);

gulp.task('buildApp', () => {
    return gulp.src('./client/scripts/main.js')
        .pipe(babel({ presets: ['es2015'] }))
		.pipe( process( { context : {  } } ) )
        .pipe(gulp.dest('./public/scripts/'))
	;
});