import re
from plstackapi.openstack.client import OpenStackClient
from plstackapi.openstack.driver import OpenStackDriver
from plstackapi.core.api.auth import auth_check
from plstackapi.core.models import Sliver, Slice
from plstackapi.core.api.flavors import _get_flavors
from plstackapi.core.api.images import _get_images
from plstackapi.core.api.keys import _get_keys
from plstackapi.core.api.slices import _get_slices
from plstackapi.core.api.deployment_networks import _get_deployment_networks
from plstackapi.core.api.nodes import _get_nodes
 

def _get_slivers(filter):
    if isinstance(filter, int):
        slivers = Sliver.objects.filter(id=filter)
    elif isinstance(filter, StringTypes):
        slivers = Sliver.objects.filter(name=filter)
    elif isinstance(filer, dict):
        slivers = Sliver.objects.filter(**filter)
    else:
        slivers = []
    return slivers
 
def add_sliver(auth, fields):
    driver = OpenStackDriver(client = auth_check(auth))
    
    flavors = _get_flavor(fields.get('flavor'))
    if flavors: fields['flavor'] = flavors[0]     
    images = _get_images(fields.get('image'))
    if images: fields['image'] = images[0]     
    keys = _get_keys(fields.get('get'))
    if keys: fields['key'] = keys[0]     
    slices = _get_slices(fields.get('slice'))
    if slices: fields['slice'] = slices[0]     
    deployment_networks = _get_deployment_networks(field.get('deployment_network'))
    if deployment_networks: fields['deployment_network'] = deployment_networks[0]     
    nodes = _get_nodes(fields.get('node'))
    if nodes: fields['node'] = nodess[0]     
    
    sliver = Sliver(**fields)
    # create quantum sliver
    sliver = driver.spawn_instance(name=sliver.name,
                                   key_name = sliver.key.name,
                                   flavor=sliver.flavor.name,
                                   image = sliver.image.name,
                                   hostname = sliver.node.hostname )

    sliver.instance_id=sliver.id

    sliver.save()
    return sliver

def update_sliver(auth, sliver, **fields):
    return  

def delete_sliver(auth, filter={}):
    driver = OpenStackDriver(client = auth_check(auth))   
    slivers = _get_slivers(filter)
    for sliver in slivers:
        driver.destroy_instance(sliver.sliver_id) 
        sliver.delete()
    return 1

def get_slivers(auth, filter={}):
    client = auth_check(auth)
    if 'slice' in filter:
        slices = _get_slices(filter.get('slice'))
        if slices: filter['slice'] = slices[0]
    slivers = _get_slivers(filter)
    return slivers             
        

    
