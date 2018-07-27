<?php
/**
 * This file is part of the Prestashop Shipping module of DPD Nederland B.V.
 *
 * Copyright (C) 2017  DPD Nederland B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
require_once (_PS_MODULE_DIR_ . 'dpdbenelux' . DS . 'classes' . DS . 'DpdParcelPredict.php');
class dpdbeneluxOneStepParcelshopModuleFrontController extends ModuleFrontController
{

	public $dpdParcelPredict;

	public function __construct()
	{
		$this->dpdParcelPredict = new DpdParcelPredict();
		parent::__construct();
	}


	public function initContent()
	{
		if(Tools::getValue('method') === 'setParcelShop') {
			if(Tools::getValue('parcelId')) {
				$parcelId = Tools::getValue('parcelId');
				$this->context->cookie->parcelId = $parcelId;
				die($this->context->cookie->parcelId);
			}
		}elseif(Tools::getValue('method') === 'getParcelShops'){
			$address = new Address($this->context->cart->id_address_delivery);
			$country = new Country($address->id_country);
			$isoCode = $country->iso_code;

			$geoData = $this->dpdParcelPredict->getGeoData($address->postcode, $isoCode);
			$parcelShops = $this->dpdParcelPredict->getParcelShops($address->postcode, $isoCode);

			die(Tools::jsonEncode(
				array( 'parcelShops' => $parcelShops,
						'geoData' => $geoData
			)));
		}


	}


}
