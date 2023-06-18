#!/bin/bash -x

echo "1) install vmrun"
cd ~
mkdir guaca-zone
cd guaca-zone
wget https://download3.vmware.com/software/WKST-1702-LX/VMware-Workstation-Full-17.0.2-21581411.x86_64.bundle
sudo ./VMware-Workstation-Full-17.0.2-21581411.x86_64.bundle
echo "2) install vmware-setup-helper"
echo "3) setup a server so that an image can be uploaded here"
