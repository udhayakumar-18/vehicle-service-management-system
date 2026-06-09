# sub_views/component_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from core.models import Component
from core.serializers import ComponentSerializer


class ComponentListCreateView(APIView):

    def get(self, request):
        components = Component.objects.all()
        serializer = ComponentSerializer(components, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ComponentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ComponentDetailView(APIView):

    def get(self, request, pk):
        component = get_object_or_404(Component, pk=pk)
        serializer = ComponentSerializer(component)
        return Response(serializer.data)

    def put(self, request, pk):
        component = get_object_or_404(Component, pk=pk)
        serializer = ComponentSerializer(component, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        component = get_object_or_404(Component, pk=pk)
        component.delete()
        return Response({'message': 'Deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
