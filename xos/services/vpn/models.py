from core.models import Service, TenantWithContainer
from django.db import transaction

VPN_KIND = "vpn"


class VPNService(Service):
    """Defines the Service for creating VPN servers."""
    KIND = VPN_KIND

    class Meta:
        proxy = True
        # The name used to find this service, all directories are named this
        app_label = "vpn"
        verbose_name = "VPN Service"


class VPNTenant(TenantWithContainer):
    """Defines the Tenant for creating VPN servers."""

    class Meta:
        proxy = True
        verbose_name = "VPN Tenant"

    KIND = VPN_KIND

    sync_attributes = ("nat_ip", "nat_mac",)

    default_attributes = {'vpn_subnet': None,
                          'server_network': None,
                          'clients_can_see_each_other': True,
                          'is_persistent': True,
                          'script': None,
                          'ca_crt': None,
                          'port': None}

    def __init__(self, *args, **kwargs):
        vpn_services = VPNService.get_service_objects().all()
        if vpn_services:
            self._meta.get_field(
                "provider_service").default = vpn_services[0].id
        super(VPNTenant, self).__init__(*args, **kwargs)

    def save(self, *args, **kwargs):
        super(VPNTenant, self).save(*args, **kwargs)
        model_policy_vpn_tenant(self.pk)

    def delete(self, *args, **kwargs):
        self.cleanup_container()
        super(VPNTenant, self).delete(*args, **kwargs)

    @property
    def addresses(self):
        """Mapping[str, str]: The ip, mac address, and subnet of the NAT network of this Tenant."""
        if (not self.id) or (not self.instance):
            return {}

        addresses = {}
        for ns in self.instance.ports.all():
            if "nat" in ns.network.name.lower():
                addresses["ip"] = ns.ip
                addresses["mac"] = ns.mac
                break

        return addresses

    # This getter is necessary because nat_ip is a sync_attribute
    @property
    def nat_ip(self):
        """str: The IP of this Tenant on the NAT network."""
        return self.addresses.get("ip", None)

    # This getter is necessary because nat_mac is a sync_attribute
    @property
    def nat_mac(self):
        """str: The MAC address of this Tenant on the NAT network."""
        return self.addresses.get("mac", None)

    @property
    def server_network(self):
        """str: The IP address of the server on the VPN."""
        return self.get_attribute(
            'server_network',
            self.default_attributes['server_network'])

    @server_network.setter
    def server_network(self, value):
        self.set_attribute("server_network", value)

    @property
    def vpn_subnet(self):
        """str: The IP address of the client on the VPN."""
        return self.get_attribute(
            'vpn_subnet',
            self.default_attributes['vpn_subnet'])

    @vpn_subnet.setter
    def vpn_subnet(self, value):
        self.set_attribute("vpn_subnet", value)

    @property
    def is_persistent(self):
        """bool: True if the VPN connection is persistence, false otherwise."""
        return self.get_attribute(
            "is_persistent",
            self.default_attributes['is_persistent'])

    @is_persistent.setter
    def is_persistent(self, value):
        self.set_attribute("is_persistent", value)

    @property
    def clients_can_see_each_other(self):
        """bool: True if the client can see the subnet of the server, false otherwise."""
        return self.get_attribute(
            "clients_can_see_each_other",
            self.default_attributes['clients_can_see_each_other'])

    @clients_can_see_each_other.setter
    def clients_can_see_each_other(self, value):
        self.set_attribute("clients_can_see_each_other", value)

    @property
    def script(self):
        """string: The file name of the client script"""
        return self.get_attribute("script", self.default_attributes['script'])

    @script.setter
    def script(self, value):
        self.set_attribute("script", value)

    @property
    def ca_crt(self):
        """str: the string for the ca certificate"""
        return self.get_attribute("ca_crt", self.default_attributes['ca_crt'])

    @ca_crt.setter
    def ca_crt(self, value):
        self.set_attribute("ca_crt", value)

    @property
    def port_number(self):
        """int: the integer representing the port number for this server"""
        return self.get_attribute("port", self.default_attributes['port'])

    @port_number.setter
    def port_number(self, value):
        self.set_attribute("port", value)



def model_policy_vpn_tenant(pk):
    """Manages the contain for the VPN Tenant."""
    # This section of code is atomic to prevent race conditions
    with transaction.atomic():
        # We find all of the tenants that are waiting to update
        tenant = VPNTenant.objects.select_for_update().filter(pk=pk)
        if not tenant:
            return
        # Since this code is atomic it is safe to always use the first tenant
        tenant = tenant[0]
        tenant.manage_container()
