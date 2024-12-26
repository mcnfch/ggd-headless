module.exports = {
  apps: [{
    name: 'nextjs-woo',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    instance_var: 'nextjs-woo',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3010,
      HOST: '0.0.0.0'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3010,
      HOST: '0.0.0.0'
    }
  }]
}