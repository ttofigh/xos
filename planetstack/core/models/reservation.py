import os
import datetime
from django.db import models
from core.models import PlCoreBase
from core.models import Sliver
from core.models import Slice
from core.models import ServiceResource

# Create your models here.

class Reservation(PlCoreBase):
    startTime = models.DateTimeField()
    slice = models.ForeignKey(Slice, related_name="reservations")
    duration = models.IntegerField(default=1)

    def __unicode__(self):  return u'%s to %s' % (self.startTime, self.endTime)

    @property
    def endTime(self):
        return self.startTime + datetime.timedelta(hours=self.duration)

    def can_update(self, user):
        return self.slice.can_update(user)

    def save_by_user(self, user, *args, **kwds):
        if self.can_update(user):
            super(Reservation, self).save(*args, **kwds)

    @staticmethod
    def select_by_user(user):
        if user.is_admin:
            qs = Reservation.objects.all()
        else:
            slice_ids = [s.id for s in Slice.select_by_user(user)]
            qs = Reservation.objects.filter(id__in=slice_ids)
        return qs

class ReservedResource(PlCoreBase):
    sliver = models.ForeignKey(Sliver, related_name="reservedResourrces")
    resource = models.ForeignKey(ServiceResource, related_name="reservedResources")
    quantity = models.IntegerField(default=1)
    reservationSet = models.ForeignKey(Reservation, related_name="reservedResources")

    class Meta(PlCoreBase.Meta):
       verbose_name_plural = "Reserved Resources"

    def __unicode__(self):  return u'%d %s on %s' % (self.quantity, self.resource, self.sliver)

    def can_update(self, user):
        return self.sliver.slice.can_update(user)

    def save_by_user(self, user, *args, **kwds):
        if self.can_update(user):
            super(ReservedResource, self).save(*args, **kwds)

    @staticmethod
    def select_by_user(user):
        if user.is_admin:
            qs = ReservedResource.objects.all()
        else:
            sliver_ids = [s.id for s in Sliver.select_by_user(user)]
            qs = ReservedResource.objects.filter(id__in=sliver_ids)
        return qs


