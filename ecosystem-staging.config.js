module.exports = {
    apps : [{
        script: 'yarn run start:stage'
    }],

    deploy : {
        production : {
            user : 'root',
            host : '116.202.102.105',
            ref  : 'origin/main',
            repo : 'git@github.com:acocmor/api-speam-plan.git',
            path : '/var/www/speamplan.de/fe',
            'pre-deploy-local': '',
            'post-deploy' : 'source ~/.nvm/nvm.sh && pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env production',
            'pre-setup': '',
            'ssh_options': 'ForwardAgent=yes'
        }
    }
};
