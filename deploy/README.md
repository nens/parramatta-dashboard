# client-deployment

Some ansible scripts that can be used for all kinds of frontends that 
only need a zip to run.

## Usage
Add this repository as a git submodule to your frontends

    git submodule add git@github.com:nens/client-deployment.git deploy
    cd deploy


### Deployment

Deployment is done with `ansible`. Make sure to install ansible with eg:

    pip install ansible

Copy `hosts.example` to `hosts` and `production_hosts.example` to `production_hosts` and edit to match your server layout.

    cp hosts.example hosts
    cp production_hosts.example production_hosts

Deploy to integration:

    ansible-playbook -i deploy/hosts --limit=integration -K deploy/deploy.yml

Deploy to staging:

    ansible-playbook -i deploy/hosts --limit=staging -K deploy/deploy.yml --extra-vars="version=2.7.1"

Deploy to production:

    ansible-playbook -i deploy/production_hosts -K deploy/deploy.yml --extra-vars="version=2.7.1"
