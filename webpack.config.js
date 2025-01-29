const path = require('node:path');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');

let version = "";

try {
    const data = fs.readFileSync('tutor.php', 'utf8');
    version = data.match(/Version:\s*([\d.]+(?:-[a-zA-Z0-9]+)?)/i)?.[1] || '';
} catch (err) {
    console.log(err);
}

module.exports = (env, options) => {
    const mode = options.mode || 'development';

    const config = {
        mode,
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(js|ts|tsx)$/,
                    exclude: /node_modules/,
                    use: 'babel-loader',
                },
                {
                    test: /\.(png|jp(e*)g|gif|webp)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'images/[hash]-[name].[ext]',
                            },
                        },
                    ],
                },
                {
                    test: /\.svg$/i,
                    issuer: /\.[jt]sx?$/,
                    use: ['@svgr/webpack'],
                },
            ],
        },
        plugins: [new webpack.ProvidePlugin({ React: 'react' })],
        externals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            '@wordpress/i18n': 'wp.i18n',
        },
        devtool: 'source-map',
    };

    if ('production' === mode) {
        config.devtool = false;
        config.optimization = {
            splitChunks: {
                cacheGroups: {
                    shared: {
                        test: /[\\/]assets[\\/]react[\\/]v3[\\/]shared[\\/]/,
                        name: 'tutor-shared.min',
                        chunks: 'all',
                    },
                },
            },
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        compress: false,
                        ecma: 6,
                        mangle: true,
                    },
                    extractComments: false,
                }),
            ],
        };
    }

    const react_blueprints = [
        {
            dest_path: './assets/js',
            src_files: {
                'tutor.min': './assets/react/v2/common.js',
                'tutor-front.min': './assets/react/front/tutor-front.js',
                'tutor-admin.min': './assets/react/admin-dashboard/tutor-admin.js',
                'tutor-setup.min': './assets/react/admin-dashboard/tutor-setup.js',
                'tutor-gutenberg.min': './assets/react/gutenberg/index.js',
                'tutor-course-builder.min': './assets/react/v3/entries/course-builder/index.tsx',
                'tutor-order-details.min': './assets/react/v3/entries/order-details/index.tsx',
                'tutor-coupon.min': './assets/react/v3/entries/coupon-details/index.tsx',
                'tutor-tax-settings.min': './assets/react/v3/entries/tax-settings/index.tsx',
                'tutor-payment-settings.min': './assets/react/v3/entries/payment-settings/index.tsx',
                'tutor-addon-list.min': './assets/react/v3/entries/addon-list/index.tsx',
            }
        }
    ];

    const configEditors = [];
    for (let i = 0; i < react_blueprints.length; i++) {
        const { src_files, dest_path } = react_blueprints[i];

        configEditors.push(
            Object.assign({}, config, {
                name: 'configEditor',
                entry: src_files,
                output: {
                    path: path.resolve(dest_path),
                    filename: '[name].js',
                    chunkFilename: `lazy-chunks/[name].[contenthash].min.js?v=${version}`,
                    clean: true,
                },
                resolve: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                    fallback: {
                        fs: false,
                        path: false,
                        os: false,
                    },
                    alias: {
                        '@TutorShared': path.resolve(__dirname, './assets/react/v3/shared'),
                        '@SharedImages': path.resolve(__dirname, './assets/react/v3/public/images'),
                        '@CourseBuilderComponents': path.resolve(__dirname, './assets/react/v3/entries/course-builder/components/'),
                        '@CourseBuilderServices': path.resolve(__dirname, './assets/react/v3/entries/course-builder/services/'),
                        '@CourseBuilderConfig': path.resolve(__dirname, './assets/react/v3/entries/course-builder/config/'),
                        '@CourseBuilderPages': path.resolve(__dirname, './assets/react/v3/entries/course-builder/pages/'),
                        '@CourseBuilderUtils': path.resolve(__dirname, './assets/react/v3/entries/course-builder/utils/'),
                        '@CourseBuilderContexts': path.resolve(__dirname, './assets/react/v3/entries/course-builder/contexts/'),
                        '@OrderComponents': path.resolve(__dirname, './assets/react/v3/entries/order-details/components/'),
                        '@OrderServices': path.resolve(__dirname, './assets/react/v3/entries/order-details/services/'),
                        '@OrderAtoms': path.resolve(__dirname, './assets/react/v3/entries/order-details/atoms/'),
                        '@OrderContexts': path.resolve(__dirname, './assets/react/v3/entries/order-details/contexts/'),
                        '@CouponComponents': path.resolve(__dirname, './assets/react/v3/entries/coupon-details/components/'),
                        '@CouponServices': path.resolve(__dirname, './assets/react/v3/entries/coupon-details/services/'),
                        '@AddonList': path.resolve(__dirname, './assets/react/v3/entries/addon-list/'),
                    },
                },
            }),
        );
    }

    return [...configEditors];
};
